# notifys

A small dependency-free notification/toast library for the browser, written in TypeScript and shipped as native ESM.

## Install

```bash
npm install notifys
```

```ts
import {Notifier} from 'notifys';
import 'notifys/style.css';

const notifier = new Notifier('top-center');
notifier.error('Whoops. An error occurred.');
```

Supported positions are `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, and `bottom-right`.

You can also use the exported constants:

```ts
import {Notifier, Position} from 'notifys';

const notifier = new Notifier(Position.topRight);
```

## Options

```ts
notifier.success({
    message: 'Saved successfully',
    duration: 5000,
    pauseOnHover: true,
    showProgress: true,
    appearAnimation: 'fadeInRight',
    disappearAnimation: 'fadeOutRight',
});
```

`duration` is optional and defaults to `3000`. Set it to `0` to keep a notification open until it is closed manually.

Animations are optional. Animation names are compatible with animate.css class names with or without the `animate__` prefix. If the animation CSS is missing, notifys still guarantees DOM cleanup.

## Expanded notifications and actions

```ts
notifier.warning({
    title: 'Unsaved changes',
    message: 'Leave this page?',
    expand: true,
    duration: 0,
    renderActions(close) {
        const actions = document.createElement('div');
        actions.classList.add('notify__actions');

        const button = document.createElement('button');
        button.classList.add('btn-outline');
        button.textContent = 'Close';
        button.addEventListener('click', close);

        actions.appendChild(button);
        return actions;
    },
});
```

## HTML content

Messages are rendered as text by default. This avoids accidentally injecting untrusted HTML.

If the message is trusted and HTML rendering is intentional, opt in explicitly:

```ts
notifier.info({
    message: '<strong>Trusted HTML</strong>',
    allowHtml: true,
});
```

Custom `icon` values are also inserted as trusted SVG/HTML. Do not pass unsanitized user input to `icon` or to an `allowHtml` message.

## Custom notifications

```ts
import {Notification, Notifier} from 'notifys';

const notifier = new Notifier();
const notification = new Notification({
    message: 'Custom notification',
    classes: 'my-custom-notify',
    duration: 0,
});

notifier.notify(notification);
```

A `Notification` instance is single-use and can only be rendered once.

## Queue management

```ts
notifier.firstNotify;
notifier.lastNotify;

notifier.removeFirst();
notifier.removeLast();
notifier.removeAll();
notifier.setPosition('bottom-right');
```

## SPA cleanup

Call `destroy()` when the notifier belongs to a component/application scope that is being unmounted:

```ts
notifier.destroy();
```

`destroy()` cancels active timers, releases notifications, clears the queue, and removes the container from the DOM.

## Performance

notifys does not poll progress every 10 ms. Each timed notification uses one timeout, while the progress indicator is compositor-friendly CSS `transform` animation. Hover pause stops both the timeout and progress animation.

## Migration from 1.x

Version 2 intentionally tightens a few behaviours:

- `message` is text by default; use `allowHtml: true` for trusted HTML.
- invalid positions and negative/non-finite durations throw early.
- a `Notification` instance may only be mounted once.
- caller-owned options are never mutated.
- `destroy()` is available for deterministic SPA cleanup.
- the old root and `*.min.*` file paths remain compatibility shims, but new code should use the package exports shown above.

## Development

```bash
npm run typecheck
npm test
npm pack --dry-run
```

The package has no runtime dependencies.
