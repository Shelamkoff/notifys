import {Position, type NotificationOptions, type Position as PositionValue} from './types.js';
import type {NotificationClass} from './icons.js';

export const DEFAULT_DURATION = 3000;
export const ANIMATION_FALLBACK_BUFFER_MS = 50;

const POSITIONS = new Set<PositionValue>(Object.values(Position));

export function assertPosition(position: string): asserts position is PositionValue {
    if (!POSITIONS.has(position as PositionValue)) {
        throw new RangeError(`Unsupported notification position: ${position}`);
    }
}

export function normalizeAnimationName(name: string | undefined): string | undefined {
    if (name === undefined) return undefined;
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    if (/\s/.test(trimmed)) {
        throw new RangeError('Animation name must be a single CSS class name.');
    }
    return trimmed.startsWith('animate__') ? trimmed : `animate__${trimmed}`;
}

export function normalizeDuration(duration: number | undefined): number {
    const value = duration ?? DEFAULT_DURATION;
    if (!Number.isFinite(value) || value < 0) {
        throw new RangeError('Notification duration must be a finite number greater than or equal to 0.');
    }
    return value;
}

export function mergeClasses(classes: string | undefined, type: NotificationClass | undefined): string | undefined {
    const tokens = new Set<string>();

    if (classes) {
        for (const token of classes.trim().split(/\s+/)) {
            if (token) tokens.add(token);
        }
    }

    if (type) tokens.add(type);
    return tokens.size > 0 ? [...tokens].join(' ') : undefined;
}

export function withDefaultIcon(options: string | NotificationOptions, icon: string): NotificationOptions {
    if (typeof options === 'string') return {message: options, icon};
    return {...options, icon: options.icon ?? icon};
}

export function now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function parseCssTime(value: string): number {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed) || 0;
    if (trimmed.endsWith('s')) return (Number.parseFloat(trimmed) || 0) * 1000;
    return 0;
}

export function maximumAnimationTime(element: HTMLElement): number {
    if (typeof getComputedStyle !== 'function') return 0;

    const style = getComputedStyle(element);
    const durations = style.animationDuration.split(',').map(parseCssTime);
    const delays = style.animationDelay.split(',').map(parseCssTime);
    const length = Math.max(durations.length, delays.length);
    let max = 0;

    for (let index = 0; index < length; index += 1) {
        const duration = durations[index % durations.length] ?? 0;
        const delay = delays[index % delays.length] ?? 0;
        max = Math.max(max, duration + delay);
    }

    return max;
}
