import assert from 'node:assert/strict';
import test, {beforeEach} from 'node:test';
import {Notification, Notifier, Position} from '../dist/notify.js';

class FakeClassList {
    #tokens = new Set();

    add(...tokens) {
        for (const token of tokens) {
            if (!token) throw new Error('Empty class token');
            if (/\s/.test(token)) throw new Error('Invalid class token');
            this.#tokens.add(token);
        }
    }

    remove(...tokens) {
        for (const token of tokens) this.#tokens.delete(token);
    }

    contains(token) {
        return this.#tokens.has(token);
    }

    replace(oldToken, newToken) {
        if (!this.#tokens.has(oldToken)) return false;
        this.#tokens.delete(oldToken);
        this.#tokens.add(newToken);
        return true;
    }

    toArray() {
        return [...this.#tokens];
    }
}

class FakeStyle {
    #properties = new Map();
    animationPlayState = '';

    setProperty(name, value) {
        this.#properties.set(name, value);
    }

    getPropertyValue(name) {
        return this.#properties.get(name) ?? '';
    }
}

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.classList = new FakeClassList();
        this.style = new FakeStyle();
        this.children = [];
        this.parentElement = null;
        this.attributes = new Map();
        this.listeners = new Map();
        this.textContent = '';
        this.innerHTML = '';
        this.type = '';
    }

    appendChild(child) {
        child.remove();
        this.children.push(child);
        child.parentElement = this;
        return child;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index >= 0) this.children.splice(index, 1);
        child.parentElement = null;
        return child;
    }

    remove() {
        this.parentElement?.removeChild(this);
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    addEventListener(type, listener, options = undefined) {
        const listeners = this.listeners.get(type) ?? [];
        listeners.push({listener, once: options?.once === true});
        this.listeners.set(type, listeners);
    }

    dispatchEvent(event) {
        const listeners = [...(this.listeners.get(event.type) ?? [])];
        for (const entry of listeners) {
            entry.listener.call(this, event);
            if (entry.once) {
                const current = this.listeners.get(event.type) ?? [];
                this.listeners.set(event.type, current.filter(item => item !== entry));
            }
        }
        return true;
    }
}

let computedAnimationDuration = '0s';
let computedAnimationDelay = '0s';

function installDom() {
    const body = new FakeElement('body');
    globalThis.window = globalThis;
    globalThis.document = {
        body,
        createElement(tagName) {
            return new FakeElement(tagName);
        },
    };
    globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 0);
    globalThis.getComputedStyle = () => ({
        animationDuration: computedAnimationDuration,
        animationDelay: computedAnimationDelay,
    });
}

function findByClass(element, className) {
    if (element.classList.contains(className)) return element;
    for (const child of element.children) {
        const match = findByClass(child, className);
        if (match) return match;
    }
    return null;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

beforeEach(() => {
    computedAnimationDuration = '0s';
    computedAnimationDelay = '0s';
    installDom();
});

test('module can be imported before a DOM is installed', () => {
    assert.equal(typeof Notifier, 'function');
    assert.equal(typeof Notification, 'function');
});

test('accepts string positions while preserving Position constants', () => {
    const notifier = new Notifier('top-center');
    notifier.setPosition(Position.bottomCenter);
    assert.equal(document.body.children.length, 1);
    notifier.destroy();
    assert.equal(document.body.children.length, 0);
});

test('does not mutate caller options and merges semantic classes once', () => {
    const options = {
        message: 'Boom',
        classes: 'custom  custom',
        duration: 0,
    };

    const notifier = new Notifier();
    const notification = notifier.error(options);

    assert.equal(options.classes, 'custom  custom');
    assert.equal('icon' in options, false);
    assert.equal(notification.options.classes, 'custom notify__error');
    assert.equal(notification.element.classList.contains('custom'), true);
    assert.equal(notification.element.classList.contains('notify__error'), true);
    assert.equal(Object.isFrozen(notification.options), true);

    notifier.destroy();
});

test('rejects invalid durations and malformed animation class names', () => {
    assert.throws(() => new Notification({message: 'nan', duration: Number.NaN}), /finite number/);
    assert.throws(() => new Notification({message: 'inf', duration: Number.POSITIVE_INFINITY}), /finite number/);
    assert.throws(() => new Notification({message: 'negative', duration: -1}), /finite number/);
    assert.throws(() => new Notification({message: 'bad class', appearAnimation: 'fade in'}), /single CSS class/);
});

test('duration zero stays visible until explicitly removed', async () => {
    const notifier = new Notifier();
    const notification = notifier.simple({message: 'persistent', duration: 0});
    await delay(30);
    assert.notEqual(notification.element, undefined);
    notifier.remove(notification);
    assert.equal(notification.element, undefined);
    notifier.destroy();
});

test('arbitrary durations close without polling or exact-zero assumptions', async () => {
    const notifier = new Notifier();
    const notification = notifier.simple({message: 'short', duration: 25});

    await delay(60);

    assert.equal(notification.element, undefined);
    assert.equal(notifier.firstNotify, null);
    notifier.destroy();
});

test('pauseOnHover suspends and resumes both lifetime and progress state', async () => {
    const notifier = new Notifier();
    const notification = notifier.simple({message: 'pause', duration: 35, pauseOnHover: true});
    const element = notification.element;
    const progress = findByClass(element, 'notify__progress');

    await delay(10);
    element.dispatchEvent({type: 'mouseenter'});
    assert.equal(progress.style.animationPlayState, 'paused');

    await delay(45);
    assert.notEqual(notification.element, undefined);

    element.dispatchEvent({type: 'mouseleave'});
    assert.equal(progress.style.animationPlayState, 'running');

    await delay(40);
    assert.equal(notification.element, undefined);
    notifier.destroy();
});

test('exit cleanup does not depend on requestAnimationFrame', async () => {
    globalThis.requestAnimationFrame = () => 0;
    const notifier = new Notifier();
    const notification = notifier.simple({
        message: 'close',
        duration: 0,
        disappearAnimation: 'fadeOut',
    });

    notification.unsetElement();
    await Promise.resolve();

    assert.equal(notification.element, undefined);
    assert.equal(notifier.firstNotify, null);
    notifier.destroy();
});

test('exit animation has a timeout fallback when animationend never arrives', async () => {
    computedAnimationDuration = '0.02s';
    const notifier = new Notifier();
    const notification = notifier.simple({
        message: 'fallback',
        duration: 0,
        disappearAnimation: 'fadeOut',
    });

    notification.unsetElement();
    assert.notEqual(notification.element, undefined);
    await delay(90);
    assert.equal(notification.element, undefined);
    assert.equal(notifier.firstNotify, null);
    notifier.destroy();
});

test('message content is text by default and HTML is explicit opt-in', () => {
    const notifier = new Notifier();

    const safe = notifier.simple({message: '<b>safe</b>', duration: 0});
    const safeMessage = findByClass(safe.element, 'notify__message');
    assert.equal(safeMessage.textContent, '<b>safe</b>');
    assert.equal(safeMessage.innerHTML, '');

    const html = notifier.simple({message: '<b>trusted</b>', allowHtml: true, duration: 0});
    const htmlMessage = findByClass(html.element, 'notify__message');
    assert.equal(htmlMessage.innerHTML, '<b>trusted</b>');

    notifier.destroy();
});

test('a Notification instance cannot be mounted twice', () => {
    const notification = new Notification({message: 'once', duration: 0});
    notification.render();
    assert.throws(() => notification.render(), /only be rendered once/);
    notification.destroy();
});

test('removal is idempotent', async () => {
    const notifier = new Notifier();
    const notification = notifier.simple({message: 'once', duration: 0, disappearAnimation: 'fadeOut'});
    notification.unsetElement();
    notification.unsetElement();
    await Promise.resolve();
    assert.equal(notification.element, undefined);
    assert.equal(notifier.firstNotify, null);
    notifier.destroy();
});

test('destroy immediately releases notifications and container', () => {
    const notifier = new Notifier();
    const notification = notifier.simple({message: 'forever', duration: 0});

    assert.equal(document.body.children.length, 1);
    assert.notEqual(notification.element, undefined);

    notifier.destroy();

    assert.equal(notification.element, undefined);
    assert.equal(notifier.firstNotify, null);
    assert.equal(document.body.children.length, 0);
    assert.throws(() => notifier.simple('nope'), /destroyed/);
});
