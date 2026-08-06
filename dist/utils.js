import { Position } from './types.js';
export const DEFAULT_DURATION = 3000;
export const ANIMATION_FALLBACK_BUFFER_MS = 50;
const POSITIONS = new Set(Object.values(Position));
export function assertPosition(position) {
    if (!POSITIONS.has(position)) {
        throw new RangeError(`Unsupported notification position: ${position}`);
    }
}
export function normalizeAnimationName(name) {
    if (!name)
        return undefined;
    return name.startsWith('animate__') ? name : `animate__${name}`;
}
export function normalizeDuration(duration) {
    const value = duration ?? DEFAULT_DURATION;
    if (!Number.isFinite(value) || value < 0) {
        throw new RangeError('Notification duration must be a finite number greater than or equal to 0.');
    }
    return value;
}
export function mergeClasses(classes, type) {
    const tokens = new Set();
    if (classes) {
        for (const token of classes.trim().split(/\s+/)) {
            if (token)
                tokens.add(token);
        }
    }
    if (type)
        tokens.add(type);
    return tokens.size > 0 ? [...tokens].join(' ') : undefined;
}
export function withDefaultIcon(options, icon) {
    if (typeof options === 'string')
        return { message: options, icon };
    return { ...options, icon: options.icon ?? icon };
}
export function now() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
function parseCssTime(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return 0;
    if (trimmed.endsWith('ms'))
        return Number.parseFloat(trimmed) || 0;
    if (trimmed.endsWith('s'))
        return (Number.parseFloat(trimmed) || 0) * 1000;
    return 0;
}
export function maximumAnimationTime(element) {
    if (typeof getComputedStyle !== 'function')
        return 0;
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
