import {CLOSE_ICON, NotificationClass} from './icons.js';
import type {INotification, LifecycleState, NormalizedNotificationOptions, NotificationOptions, OnRemovedHandler} from './types.js';
import {ANIMATION_FALLBACK_BUFFER_MS, maximumAnimationTime, normalizeAnimationName, normalizeDuration, now} from './utils.js';

export class Notification implements INotification {
    protected readonly _options: Readonly<NormalizedNotificationOptions>;
    protected _element: HTMLElement | undefined;
    protected _onRemoved: OnRemovedHandler | undefined;

    private state: LifecycleState = 'idle';
    private lifetimeTimer: number | undefined;
    private exitFallbackTimer: number | undefined;
    private remainingMs = 0;
    private deadline = 0;
    private paused = false;

    constructor(options: NotificationOptions) {
        this._options = Object.freeze({
            ...options,
            duration: normalizeDuration(options.duration),
            pauseOnHover: options.pauseOnHover ?? true,
            showProgress: options.showProgress ?? true,
            allowHtml: options.allowHtml ?? false,
            appearAnimation: normalizeAnimationName(options.appearAnimation),
            disappearAnimation: normalizeAnimationName(options.disappearAnimation),
        });
    }

    get options(): Readonly<NotificationOptions> {
        return this._options;
    }

    get element(): HTMLElement | undefined {
        return this._element;
    }

    set onRemoved(value: OnRemovedHandler | undefined) {
        this._onRemoved = value;
    }

    render(): HTMLElement {
        if (this.state !== 'idle') throw new Error('A Notification instance can only be rendered once.');

        const element = this.doRender();
        this._element = element;
        this.state = 'visible';

        if (this._options.classes) {
            element.classList.add(...this._options.classes.split(/\s+/).filter(Boolean));
        }

        const progressBar = this.renderProgressBar();
        if (progressBar) element.appendChild(progressBar);

        this.configureAccessibility(element);
        this.applyAppearAnimation(element);
        this.startLifetime(element, progressBar);
        return element;
    }

    unsetElement(): void {
        if (this.state === 'closing' || this.state === 'closed') return;

        this.clearLifetimeTimer();
        this.state = 'closing';
        const element = this._element;

        if (!element || !this._options.disappearAnimation) {
            this.finalizeRemoval();
            return;
        }

        const appearAnimation = this._options.appearAnimation;
        const disappearAnimation = this._options.disappearAnimation;
        element.classList.add('animate__animated');
        if (appearAnimation && element.classList.contains(appearAnimation)) {
            element.classList.remove(appearAnimation);
        }
        element.classList.add(disappearAnimation);

        const finish = (): void => this.finalizeRemoval();
        element.addEventListener('animationend', finish, {once: true});

        const animationTime = maximumAnimationTime(element);
        if (animationTime <= 0) {
            queueMicrotask(finish);
            return;
        }

        this.exitFallbackTimer = window.setTimeout(finish, animationTime + ANIMATION_FALLBACK_BUFFER_MS);
    }

    destroy(): void {
        if (this.state === 'closed') return;
        this.clearLifetimeTimer();
        this.clearExitFallbackTimer();
        this.finalizeRemoval();
    }

    renderProgressBar(): HTMLElement | null {
        if (!this._options.showProgress || this._options.duration <= 0) return null;

        const element = document.createElement('div');
        element.classList.add('notify__progress');
        element.style.setProperty('--notify-duration', `${this._options.duration}ms`);
        return element;
    }

    renderMessage(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify__message');

        if (this._options.allowHtml) element.innerHTML = this._options.message;
        else element.textContent = this._options.message;

        return element;
    }

    renderBody(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify__body');

        const icon = this.renderIcon();
        if (icon) element.appendChild(icon);
        element.appendChild(this.renderMessage());

        const actions = this.renderActions();
        if (actions) element.appendChild(actions);

        const closeButton = this.renderCloseBtn();
        if (closeButton) {
            closeButton.addEventListener('click', () => this.unsetElement());
            element.appendChild(closeButton);
        }

        return element;
    }

    renderActions(): HTMLElement | null {
        const renderer = this._options.renderActions;
        return renderer ? renderer(() => this.unsetElement()) : null;
    }

    renderIcon(): HTMLElement | null {
        if (!this._options.icon) return null;

        const element = document.createElement('div');
        element.classList.add('notify__icon__wrapper');
        element.innerHTML = this._options.icon;
        return element;
    }

    renderCloseBtn(): HTMLElement | null {
        const element = document.createElement('button');
        element.type = 'button';
        element.classList.add('btn-close');
        element.setAttribute('aria-label', 'Close notification');
        element.innerHTML = CLOSE_ICON;
        return element;
    }

    protected doRender(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify');
        element.appendChild(this.renderBody());
        return element;
    }

    private startLifetime(element: HTMLElement, progressBar: HTMLElement | null): void {
        if (this._options.duration <= 0) return;

        this.remainingMs = this._options.duration;
        this.armLifetimeTimer();
        if (!this._options.pauseOnHover) return;

        element.addEventListener('mouseenter', () => {
            if (this.state !== 'visible' || this.paused) return;
            this.paused = true;
            this.remainingMs = Math.max(0, this.deadline - now());
            this.clearLifetimeTimer();
            if (progressBar) progressBar.style.animationPlayState = 'paused';
        });

        element.addEventListener('mouseleave', () => {
            if (this.state !== 'visible' || !this.paused) return;
            this.paused = false;
            if (progressBar) progressBar.style.animationPlayState = 'running';
            if (this.remainingMs <= 0) this.unsetElement();
            else this.armLifetimeTimer();
        });
    }

    private armLifetimeTimer(): void {
        this.clearLifetimeTimer();
        this.deadline = now() + this.remainingMs;
        this.lifetimeTimer = window.setTimeout(() => {
            this.lifetimeTimer = undefined;
            this.remainingMs = 0;
            this.unsetElement();
        }, this.remainingMs);
    }

    private clearLifetimeTimer(): void {
        if (this.lifetimeTimer === undefined) return;
        window.clearTimeout(this.lifetimeTimer);
        this.lifetimeTimer = undefined;
    }

    private clearExitFallbackTimer(): void {
        if (this.exitFallbackTimer === undefined) return;
        window.clearTimeout(this.exitFallbackTimer);
        this.exitFallbackTimer = undefined;
    }

    private applyAppearAnimation(element: HTMLElement): void {
        const animation = this._options.appearAnimation;
        if (!animation) return;

        element.classList.add('animate__animated');
        requestAnimationFrame(() => {
            if (this.state === 'visible' && this._element === element) element.classList.add(animation);
        });
    }

    private configureAccessibility(element: HTMLElement): void {
        if (element.classList.contains(NotificationClass.error)) {
            element.setAttribute('role', 'alert');
            element.setAttribute('aria-live', 'assertive');
        } else {
            element.setAttribute('role', 'status');
            element.setAttribute('aria-live', 'polite');
        }
    }

    private finalizeRemoval(): void {
        if (this.state === 'closed') return;

        this.clearLifetimeTimer();
        this.clearExitFallbackTimer();
        const element = this._element;
        this._element = undefined;
        this.state = 'closed';
        element?.remove();

        const onRemoved = this._onRemoved;
        this._onRemoved = undefined;
        onRemoved?.(this);
    }
}
