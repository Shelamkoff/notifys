import { type INotification, type NotificationOptions, type Position as PositionValue } from './types.js';
export declare class Notifier {
    private readonly queue;
    private position;
    private readonly container;
    private destroyed;
    constructor(position?: PositionValue);
    get lastNotify(): INotification | null;
    get firstNotify(): INotification | null;
    setPosition(position: PositionValue): void;
    simple(options: string | NotificationOptions): INotification;
    error(options: string | NotificationOptions): INotification;
    warning(options: string | NotificationOptions): INotification;
    info(options: string | NotificationOptions): INotification;
    success(options: string | NotificationOptions): INotification;
    notify(notification: INotification): INotification;
    remove(notification: INotification): void;
    removeByIndex(index: number): void;
    removeAll(): void;
    removeFirst(): void;
    removeLast(): void;
    destroy(): void;
    private createNotification;
    private detach;
    private assertActive;
}
