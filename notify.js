export function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const result = template.content.children;
    if (result.length === 1)
        return result[0];
    return result;
}

export class Notifier {
    constructor(position = null) {
        this._queue = []
        this._position = position;

        this._container = createElementFromHTML('<div class="notify__container"></div>');
        if (typeof position === 'string') this._container.classList.add(position);

        document.body.appendChild(this._container)
    }

    get lastNotify() {
        if (this._queue.length === 0) return null
        return this._queue[this._queue.length - 1]
    }

    get firstNotify() {
        if (this._queue.length === 0) return null
        return this._queue[0]
    }

    setPosition(position) {
        if (!this._position) {
            this._container.classList.add(this._position = position);
            return
        }

        this._container.classList.replace(this._position, position);
        this._position = position
    }

    simple(options) {
        return this.notify(this.__createNotification(options, undefined, 'Notification'))
    }

    notify(notification) {
        this._queue.push(notification);
        this._container.appendChild(notification.render(this));
    }

    __createNotification(options, type, title) {
        if (typeof options === 'string') {
            options = {message: options};
        }

        if (typeof options.classes === 'string' && !options.classes.includes(type)) {
            options.classes = options.classes + ' ' + type;
        } else {
            options.classes = type;
        }

        if (options.expand) {
            if (!options.title) options.title = title;
            return new ExpandedNotification(options)
        }

        return new Notification(options)
    }

    error(options) {
        if (!options.icon) {
            options.icon = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z" /><path d="M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1" /><path d="M8.5 11.5l1.5 -1.5l-1.5 -1.5" /><path d="M15.5 11.5l-1.5 -1.5l1.5 -1.5" /></svg>'
        }

        this.notify(this.__createNotification(options, 'notify__error', 'Error'))
    }

    warning(options) {

        if (!options.icon) {
            options.icon = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" /></svg>'
        }

        this.notify(this.__createNotification(options, 'notify__warning', 'Warning'))
    }

    info(options) {
        if (!options.icon) {
            options.icon = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.875 6.27c.7 .398 1.13 1.143 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>'
        }

        this.notify(this.__createNotification(options, 'notify__info', 'Info'))
    }

    success(options) {
        if (!options.icon) {
            options.icon = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-checks"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 12l5 5l10 -10" /><path d="M2 12l5 5m5 -5l5 -5" /></svg>'
        }

        this.notify(this.__createNotification(options, 'notify__success', 'Success'))
    }

    remove(notification) {
        const index = this._queue.indexOf(notification)
        if (index > -1) {
            notification.removeElement(this._container);
            this._queue.splice(index, 1)[0]

            notification.notify = null
        }
    }

    removeByIndex(index) {
        let n;
        if ((n = this._queue[index]) !== undefined) this.remove(n)
    }

    removeAll() {
        while (this._queue.length > 0) {
            this.removeFirst()
        }
    }

    removeFirst() {
        this.removeByIndex(0)
    }

    removeLast() {
        this.removeByIndex(this._queue.length - 1)
    }
}

export class Notification {
    constructor(options) {
        let _a, _b, _c, _d, _e;
        this.message = options.message;
        this.duration = (_a = options.duration) !== null && _a !== void 0 ? _a : 3000;
        this.icon = options.icon;
        this.pauseOnHover = (_b = options.pauseOnHover) !== null && _b !== void 0 ? _b : true;
        this.showProgress = (_c = options.showProgress) !== null && _c !== void 0 ? _c : true;
        this.appearAnimation = (_d = options.appearAnimation) !== null && _d !== void 0 ? 'animate__' + _d : null;
        this.disappearAnimation = (_e = options.disappearAnimation) !== null && _e !== void 0 ? 'animate__' + _e : null;
        if (options.classes) this.classes = options.classes;
        if (options.renderActions) this.renderActions = (notifier) => {
            return options.renderActions(() => notifier.remove(this));
        }

    }

    render(notifier) {
        this.notifier = notifier
        this.element = this.doRender(notifier);
        if (typeof this.classes === 'string') {
            this.element.classList.add(...this.classes.split(' '));
        }
        const progressBar = this.renderProgressBar(notifier);
        if (progressBar !== null) {
            this.element.appendChild(progressBar);
        }
        let duration = this.duration;
        if (duration > 0) {
            let isPaused = false;
            if (this.pauseOnHover) {
                this.element.onmouseover = () => isPaused = true;
                this.element.onmouseleave = () => isPaused = false;
            }
            this.interval = setInterval(() => {
                if (duration === 0) {
                    notifier.remove(this)
                } else {
                    if (isPaused)
                        return;
                    duration -= 10;
                    if (progressBar !== null) {
                        progressBar.style.width = `${duration / this.duration * 100}%`;
                    }
                }
            }, 10);
        }

        if (typeof this.appearAnimation === 'string') {
            this.element.classList.add('animate__animated');
            requestAnimationFrame(() => this.element.classList.add(this.appearAnimation));
        }


        return this.element;
    }

    renderProgressBar(notifier) {
        if (!this.showProgress) return null
        if (this.duration > 0) {
            const el = document.createElement('div');
            el.classList.add('notify__progress');
            return el;
        }
        return null;
    }

    renderMessage(notifier) {
        return createElementFromHTML(`<div class="notify__message">${this.message}</div>`)
    }

    renderBody(notifier) {
        const el = createElementFromHTML('<div class="notify__body"></div>');
        const icon = this.renderIcon();
        if (icon !== null)
            el.appendChild(icon);
        el.appendChild(this.renderMessage());
        const actions = this.renderActions(notifier);
        if (actions !== null) el.appendChild(actions)
        const btn = this.renderCloseBtn()
        btn.addEventListener('click', () => this.notifier.remove(this))
        el.appendChild(btn);

        return el;
    }

    renderActions(notifier) {
        return null
    }

    renderIcon(notifier) {
        if (this.icon !== undefined) {
            return createElementFromHTML(`<div class="notify__icon__wrapper">${this.icon}</div>`);
        }
        return null;
    }

    renderCloseBtn(notifier) {
        const el = document.createElement('button');
        el.setAttribute('class', 'btn-close');
        el.innerHTML = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>';

        return el
    }

    doRender(notifier) {
        const el = createElementFromHTML('<div class="notify"></div>');
        el.appendChild(this.renderBody(notifier));
        return el;
    }

    removeElement(container) {
        if (this.interval) clearTimeout(this.interval);
        if (this.element !== undefined && this.element !== null) {
            const remove = () => {
                container.removeChild(this.element)
                this.element = null
            }

            if (typeof this.disappearAnimation === "string") {
                if (typeof this.appearAnimation === "string") {
                    requestAnimationFrame(() => this.element.classList.replace(this.appearAnimation, this.disappearAnimation));
                    this.element.onanimationend = remove
                } else {
                    requestAnimationFrame(() => this.element.classList.add(this.disappearAnimation));
                    this.element.onanimationend = remove
                }
            } else remove()
        }
    }
}

class ExpandedNotification extends Notification {
    constructor(options) {
        super(options)
        this.title = options.title || 'Notification'
    }

    doRender(notifier) {
        const el = createElementFromHTML('<div class="notify notify__expanded"></div>');

        el.appendChild(this.renderHeader(notifier))
        el.appendChild(this.renderBody(notifier));

        return el;
    }

    renderBody(notifier) {
        const el = createElementFromHTML('<div class="notify__body"></div>');
        el.appendChild(this.renderMessage())
        const actions = this.renderActions(notifier);
        if (actions !== null) el.appendChild(actions)

        return el;
    }

    renderHeader(notifier) {
        const el = createElementFromHTML('<div class="notify__header"></div>');

        const icon = this.renderIcon();
        if (icon !== null) el.appendChild(icon);

        el.appendChild(this.renderTitle());

        const closeBtn = this.renderCloseBtn();

        if (closeBtn !== null) {
            el.appendChild(closeBtn)
            closeBtn.addEventListener('click', () => this.notifier.remove(this))
        }

        return el
    }

    renderTitle(notifier) {
        return createElementFromHTML(`<div class="notify__title">${this.title}</div>`)
    }
}
