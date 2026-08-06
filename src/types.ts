export const Position = {
    topCenter: 'top-center',
    topLeft: 'top-left',
    topRight: 'top-right',
    bottomCenter: 'bottom-center',
    bottomRight: 'bottom-right',
    bottomLeft: 'bottom-left',
} as const;

export type Position = typeof Position[keyof typeof Position];

export type OnRemovedHandler = (notification: INotification) => void;
export type LifecycleState = 'idle' | 'visible' | 'closing' | 'closed';

export interface NotificationOptions {
    message: string;
    renderActions?: ((close: () => void) => HTMLElement) | undefined;
    appearAnimation?: string | undefined;
    disappearAnimation?: string | undefined;
    classes?: string | undefined;
    duration?: number | undefined;
    showProgress?: boolean | undefined;
    pauseOnHover?: boolean | undefined;
    expand?: boolean | undefined;
    title?: string | undefined;
    /** Trusted SVG/HTML only. */
    icon?: string | undefined;
    /** Renders message as trusted HTML. Text rendering is the safe default. */
    allowHtml?: boolean | undefined;
}

export interface NormalizedNotificationOptions extends NotificationOptions {
    duration: number;
    showProgress: boolean;
    pauseOnHover: boolean;
    allowHtml: boolean;
}

export interface INotification {
    render(): HTMLElement;
    set onRemoved(value: OnRemovedHandler | undefined);
    get element(): HTMLElement | undefined;
    unsetElement(): void;
    destroy?(): void;
    get options(): Readonly<NotificationOptions>;
}
