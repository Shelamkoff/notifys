import { Notification } from './notification.js';
export declare class ExpandedNotification extends Notification {
    protected doRender(): HTMLElement;
    renderBody(): HTMLElement;
    renderHeader(): HTMLElement;
    renderTitle(): HTMLElement;
}
