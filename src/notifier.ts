import {NotificationClass, NotificationTypesIcon} from './icons.js';
import {ExpandedNotification} from './expanded-notification.js';
import {Notification} from './notification.js';
import {Position, type INotification, type NotificationOptions, type Position as PositionValue} from './types.js';
import {assertPosition, mergeClasses, withDefaultIcon} from './utils.js';

export class Notifier {
    private readonly queue: INotification[] = [];
    private position: PositionValue;
    private readonly container: HTMLDivElement;
    private destroyed = false;

    constructor(position: PositionValue = Position.topCenter) {
        assertPosition(position);
        this.position = position;
        this.container = document.createElement('div');
        this.container.classList.add('notify__container', this.position);
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-relevant', 'additions removals');
        document.body.appendChild(this.container);
    }

    get lastNotify(): INotification | null {
        return this.queue.at(-1) ?? null;
    }

    get firstNotify(): INotification | null {
        return this.queue[0] ?? null;
    }

    setPosition(position: PositionValue): void {
        this.assertActive();
        assertPosition(position);
        if (position === this.position) return;
        this.container.classList.replace(this.position, position);
        this.position = position;
    }

    simple(options: string | NotificationOptions): INotification {
        return this.notify(this.createNotification(options, undefined, 'Notification'));
    }

    error(options: string | NotificationOptions): INotification {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.error), NotificationClass.error, 'Error'));
    }

    warning(options: string | NotificationOptions): INotification {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.warning), NotificationClass.warning, 'Warning'));
    }

    info(options: string | NotificationOptions): INotification {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.info), NotificationClass.info, 'Info'));
    }

    success(options: string | NotificationOptions): INotification {
        return this.notify(this.createNotification(withDefaultIcon(options, NotificationTypesIcon.success), NotificationClass.success, 'Success'));
    }

    notify(notification: INotification): INotification {
        this.assertActive();

        let element: HTMLElement;
        try {
            element = notification.render();
        } catch (error) {
            notification.onRemoved = undefined;
            throw error;
        }

        notification.onRemoved = (removed): void => this.detach(removed);
        this.queue.push(notification);
        this.container.appendChild(element);
        return notification;
    }

    remove(notification: INotification): void {
        if (!this.queue.includes(notification)) return;
        notification.unsetElement();
    }

    removeByIndex(index: number): void {
        const notification = this.queue[index];
        if (notification) this.remove(notification);
    }

    removeAll(): void {
        for (const notification of [...this.queue]) {
            notification.unsetElement();
        }
    }

    removeFirst(): void {
        const notification = this.queue[0];
        if (notification) this.remove(notification);
    }

    removeLast(): void {
        const notification = this.queue.at(-1);
        if (notification) this.remove(notification);
    }

    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;

        const notifications = this.queue.splice(0);
        for (const notification of notifications) {
            notification.onRemoved = undefined;
            if (notification.destroy) notification.destroy();
            else notification.unsetElement();
        }

        this.container.remove();
    }

    private createNotification(options: string | NotificationOptions, type?: NotificationClass, defaultTitle?: string): INotification {
        const source: NotificationOptions = typeof options === 'string' ? {message: options} : {...options};
        const normalized: NotificationOptions = {...source, classes: mergeClasses(source.classes, type)};

        if (normalized.expand === true && !normalized.title) normalized.title = defaultTitle;
        return normalized.expand === true ? new ExpandedNotification(normalized) : new Notification(normalized);
    }

    private detach(notification: INotification): void {
        notification.onRemoved = undefined;
        const index = this.queue.indexOf(notification);
        if (index >= 0) this.queue.splice(index, 1);
    }

    private assertActive(): void {
        if (this.destroyed) throw new Error('Notifier has been destroyed.');
    }
}
