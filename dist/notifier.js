import { NotificationClass, NotificationTypesIcon } from './icons.js';
import { ExpandedNotification } from './expanded-notification.js';
import { Notification } from './notification.js';
import { Position } from './types.js';
import { assertPosition, mergeClasses, withDefaultIcon } from './utils.js';
export class Notifier {
    queue = [];
    position;
    container;
    destroyed = false;
    constructor(position = Position.topCenter) {
        assertPosition(position);
        this.position = position;
        this.container = document.createElement('div');
        this.container.classList.add('notify__container', this.position);
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-relevant', 'additions removals');
        document.body.appendChild(this.container);
    }
    get lastNotify() {
        return this.queue.at(-1) ?? null;
    }
    get firstNotify() {
        return this.queue[0] ?? null;
    }
    setPosition(position) {
        this.assertActive();
        assertPosition(position);
        if (position === this.position)
            return;
        this.container.classList.replace(this.position, position);
        this.position = position;
    }
    simple(options) {
        return this.notify(this.createNotification(options, undefined, 'Notification'));
    }
    error(options) {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.error), NotificationClass.error, 'Error'));
    }
    warning(options) {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.warning), NotificationClass.warning, 'Warning'));
    }
    info(options) {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.info), NotificationClass.info, 'Info'));
    }
    success(options) {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.success), NotificationClass.success, 'Success'));
    }
    notify(notification) {
        this.assertActive();
        let element;
        try {
            element = notification.render();
        }
        catch (error) {
            notification.onRemoved = undefined;
            throw error;
        }
        notification.onRemoved = (removed) => this.detach(removed);
        this.queue.push(notification);
        this.container.appendChild(element);
        return notification;
    }
    remove(notification) {
        if (!this.queue.includes(notification))
            return;
        notification.unsetElement();
    }
    removeByIndex(index) {
        const notification = this.queue[index];
        if (notification)
            this.remove(notification);
    }
    removeAll() {
        for (const notification of [...this.queue]) {
            notification.unsetElement();
        }
    }
    removeFirst() {
        const notification = this.queue[0];
        if (notification)
            this.remove(notification);
    }
    removeLast() {
        const notification = this.queue.at(-1);
        if (notification)
            this.remove(notification);
    }
    destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        const notifications = this.queue.splice(0);
        for (const notification of notifications) {
            notification.onRemoved = undefined;
            if (notification.destroy)
                notification.destroy();
            else
                notification.unsetElement();
        }
        this.container.remove();
    }
    createNotification(options, type, defaultTitle) {
        const source = typeof options === 'string' ? { message: options } : { ...options };
        const normalized = { ...source, classes: mergeClasses(source.classes, type) };
        if (normalized.expand === true && !normalized.title)
            normalized.title = defaultTitle;
        return normalized.expand === true ? new ExpandedNotification(normalized) : new Notification(normalized);
    }
    detach(notification) {
        notification.onRemoved = undefined;
        const index = this.queue.indexOf(notification);
        if (index >= 0)
            this.queue.splice(index, 1);
    }
    assertActive() {
        if (this.destroyed)
            throw new Error('Notifier has been destroyed.');
    }
}
