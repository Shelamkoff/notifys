export var Position;
(function (Position) {
    Position["topCenter"] = "top-center";
    Position["topLeft"] = "top-left";
    Position["topRight"] = "top-right";
    Position["bottomCenter"] = "bottom-center";
    Position["bottomRight"] = "bottom-right";
    Position["bottomLeft"] = "bottom-left";
})(Position || (Position = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["error"] = "notify__error";
    NotificationType["warning"] = "notify__warning";
    NotificationType["info"] = "notify__info";
    NotificationType["success"] = "notify__success";
})(NotificationType || (NotificationType = {}));
var NotificationTypesIcon;
(function (NotificationTypesIcon) {
    NotificationTypesIcon["error"] = "<svg  xmlns=\"http://www.w3.org/2000/svg\"  width=\"24\"  height=\"24\"  viewBox=\"0 0 24 24\"  fill=\"none\"  stroke=\"currentColor\"  stroke-width=\"2\"  stroke-linecap=\"round\"  stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z\" /><path d=\"M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1\" /><path d=\"M8.5 11.5l1.5 -1.5l-1.5 -1.5\" /><path d=\"M15.5 11.5l-1.5 -1.5l1.5 -1.5\" /></svg>";
    NotificationTypesIcon["warning"] = "<svg  xmlns=\"http://www.w3.org/2000/svg\"  width=\"24\"  height=\"24\"  viewBox=\"0 0 24 24\"  fill=\"none\"  stroke=\"currentColor\"  stroke-width=\"2\"  stroke-linecap=\"round\"  stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M12 9v4\" /><path d=\"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z\" /><path d=\"M12 16h.01\" /></svg>";
    NotificationTypesIcon["info"] = "<svg  xmlns=\"http://www.w3.org/2000/svg\"  width=\"24\"  height=\"24\"  viewBox=\"0 0 24 24\"  fill=\"none\"  stroke=\"currentColor\"  stroke-width=\"2\"  stroke-linecap=\"round\"  stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M19.875 6.27c.7 .398 1.13 1.143 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z\" /><path d=\"M12 9h.01\" /><path d=\"M11 12h1v4h1\" /></svg>";
    NotificationTypesIcon["success"] = "<svg  xmlns=\"http://www.w3.org/2000/svg\"  width=\"24\"  height=\"24\"  viewBox=\"0 0 24 24\"  fill=\"none\"  stroke=\"currentColor\"  stroke-width=\"2\"  stroke-linecap=\"round\"  stroke-linejoin=\"round\"  class=\"icon icon-tabler icons-tabler-outline icon-tabler-checks\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M7 12l5 5l10 -10\" /><path d=\"M2 12l5 5m5 -5l5 -5\" /></svg>";
})(NotificationTypesIcon || (NotificationTypesIcon = {}));
export class Notifier {
    constructor(position = Position.topCenter) {
        this.queue = [];
        this.position = position;
        this.container = document.createElement('div');
        this.container.classList.add('notify__container', this.position);
        document.body.appendChild(this.container);
    }
    get lastNotify() {
        if (this.queue.length > 0)
            return this.queue[this.queue.length - 1];
        return null;
    }
    get firstNotify() {
        if (this.queue.length > 0)
            return this.queue[0];
        return null;
    }
    setPosition(position) {
        this.container.classList.replace(this.position, position);
        this.position = position;
    }
    simple(options) {
        return this.notify(this.createNotification(options, undefined, 'Notification'));
    }
    notify(n) {
        n.onRemoved = (n) => {
            this.remove(n);
        };
        this.queue.push(n);
        this.container.appendChild(n.render());
        return n;
    }
    createNotification(options, type, title) {
        if (typeof options === 'string') {
            options = {
                message: options,
                duration: 3000
            };
        }
        if (options.classes !== undefined) {
            // @ts-ignore
            if (type !== undefined && options.classes.includes(type)) {
                options.classes = options.classes + ' ' + type;
            }
        }
        else if (type !== undefined)
            options.classes = type;
        if (options.expand === true) {
            if (!options.title)
                options.title = title;
            return new ExpandedNotification(Object.assign({}, options));
        }
        return new Notification(Object.assign({}, options));
    }
    error(options) {
        if (typeof options === "string") {
            options = {
                message: options,
                icon: NotificationTypesIcon.error,
            };
        }
        else if (options.icon === undefined) {
            options.icon = NotificationTypesIcon.error;
        }
        return this.notify(this.createNotification(options, NotificationType.error, 'Error'));
    }
    warning(options) {
        if (typeof options === "string") {
            options = {
                message: options,
                icon: NotificationTypesIcon.warning,
            };
        }
        else if (options.icon === undefined) {
            options.icon = NotificationTypesIcon.warning;
        }
        return this.notify(this.createNotification(options, NotificationType.warning, 'Warning'));
    }
    info(options) {
        if (typeof options === "string") {
            options = {
                message: options,
                icon: NotificationTypesIcon.info,
            };
        }
        else if (options.icon === undefined) {
            options.icon = NotificationTypesIcon.info;
        }
        return this.notify(this.createNotification(options, NotificationType.info, 'Info'));
    }
    success(options) {
        if (typeof options === "string") {
            options = {
                message: options,
                icon: NotificationTypesIcon.success
            };
        }
        else if (options.icon === undefined) {
            options.icon = NotificationTypesIcon.success;
        }
        return this.notify(this.createNotification(options, NotificationType.success, 'Success'));
    }
    remove(n) {
        const index = this.queue.indexOf(n);
        if (index > -1) {
            if (n.element !== undefined) {
                n.onRemoved = undefined;
                n.unsetElement();
            }
            this.queue.splice(index, 1);
        }
    }
    removeByIndex(index) {
        if (this.queue[index] !== undefined)
            this.remove(this.queue[index]);
    }
    removeAll() {
        while (this.queue.length > 0)
            this.removeFirst();
    }
    removeFirst() {
        this.removeByIndex(0);
    }
    removeLast() {
        this.removeByIndex(this.queue.length - 1);
    }
}
export class Notification {
    constructor(options) {
        if (options.duration === undefined)
            options.duration = 3000;
        if (options.pauseOnHover === undefined)
            options.pauseOnHover = true;
        if (options.showProgress === undefined)
            options.showProgress = true;
        if (typeof options.appearAnimation === 'string')
            options.appearAnimation = 'animate__' + options.appearAnimation;
        if (typeof options.disappearAnimation === 'string')
            options.disappearAnimation = 'animate__' + options.disappearAnimation;
        if (options.renderActions !== undefined)
            this.renderActions = () => {
                return options.renderActions(() => this.unsetElement());
            };
        this._options = Object.assign({}, options);
    }
    get options() {
        return this._options;
    }
    get element() {
        return this._element;
    }
    unsetElement() {
        if (this.intervalId)
            clearTimeout(this.intervalId);
        if (this._element !== undefined) {
            const remove = () => {
                // @ts-ignore
                if (this._element.parentElement)
                    this._element.parentElement.removeChild(this._element);
                this._element = undefined;
            };
            if (typeof this._options.disappearAnimation === "string") {
                if (typeof this._options.appearAnimation === "string") {
                    requestAnimationFrame(() => this._element.classList.replace(this._options.appearAnimation, this._options.disappearAnimation));
                    this._element.onanimationend = remove;
                }
                else {
                    requestAnimationFrame(() => this._element.classList.add(this._options.disappearAnimation));
                    this._element.onanimationend = remove;
                }
            }
            else
                remove();
        }
        if (this._onRemoved !== undefined)
            this._onRemoved(this);
    }
    set onRemoved(value) {
        this._onRemoved = value;
    }
    render() {
        this._element = this.doRender();
        if (typeof this._options.classes === 'string') {
            this._element.classList.add(...this._options.classes.split(' '));
        }
        const progressBar = this.renderProgressBar();
        if (progressBar !== null)
            this._element.appendChild(progressBar);
        let duration = this._options.duration;
        if (duration > 0) {
            let isPaused = false;
            if (this._options.pauseOnHover === true) {
                this._element.onmouseover = () => isPaused = true;
                this._element.onmouseleave = () => isPaused = false;
            }
            this.intervalId = setInterval(() => {
                if (duration === 0)
                    this.unsetElement();
                else {
                    if (isPaused)
                        return;
                    duration -= 10;
                    if (progressBar !== null) {
                        progressBar.style.width = `${duration / this._options.duration * 100}%`;
                    }
                }
            }, 10);
        }
        if (typeof this._options.appearAnimation === 'string') {
            this._element.classList.add('animate__animated');
            // @ts-ignore
            requestAnimationFrame(() => { var _a; return (_a = this._element) === null || _a === void 0 ? void 0 : _a.classList.add(this._options.appearAnimation); });
        }
        return this._element;
    }
    renderProgressBar() {
        if (this._options.showProgress === true && this._options.duration > 0) {
            const el = document.createElement('div');
            el.classList.add('notify__progress');
            return el;
        }
        return null;
    }
    renderMessage() {
        const el = document.createElement('div');
        el.classList.add('notify__message');
        el.innerHTML = this._options.message;
        return el;
    }
    renderBody() {
        const el = document.createElement('div');
        el.classList.add('notify__body');
        const icon = this.renderIcon();
        if (icon !== null)
            el.appendChild(icon);
        el.appendChild(this.renderMessage());
        const actions = this.renderActions();
        if (actions !== null)
            el.appendChild(actions);
        const btn = this.renderCloseBtn();
        if (btn) {
            btn.addEventListener('click', () => this.unsetElement());
            el.appendChild(btn);
        }
        return el;
    }
    renderActions() {
        return null;
    }
    renderIcon() {
        if (this._options.icon === undefined)
            return null;
        const el = document.createElement('div');
        el.classList.add('notify__icon__wrapper');
        el.innerHTML = this._options.icon;
        return el;
    }
    renderCloseBtn() {
        const el = document.createElement('button');
        el.setAttribute('class', 'btn-close');
        el.innerHTML = '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>';
        return el;
    }
    doRender() {
        const el = document.createElement('div');
        el.classList.add('notify');
        el.appendChild(this.renderBody());
        return el;
    }
}
class ExpandedNotification extends Notification {
    constructor(options) {
        if (options.title === undefined)
            options.title = 'Notification';
        super(options);
    }
    doRender() {
        const el = document.createElement('div');
        el.classList.add('notify', 'notify__expanded');
        el.appendChild(this.renderHeader());
        el.appendChild(this.renderBody());
        return el;
    }
    renderBody() {
        const el = document.createElement('div');
        el.classList.add('notify__body');
        el.appendChild(this.renderMessage());
        const actions = this.renderActions();
        if (actions !== null)
            el.appendChild(actions);
        return el;
    }
    renderHeader() {
        const el = document.createElement('div');
        el.classList.add('notify__header');
        const icon = this.renderIcon();
        if (icon !== null)
            el.appendChild(icon);
        el.appendChild(this.renderTitle());
        const closeBtn = this.renderCloseBtn();
        if (closeBtn !== null) {
            el.appendChild(closeBtn);
            closeBtn.addEventListener('click', () => this.unsetElement());
        }
        return el;
    }
    renderTitle() {
        const el = document.createElement('div');
        el.classList.add('notify__title');
        // @ts-ignore
        el.innerHTML = this._options.title;
        return el;
    }
}
