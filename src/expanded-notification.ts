import {Notification} from './notification.js';

export class ExpandedNotification extends Notification {
    protected override doRender(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify', 'notify__expanded');
        element.appendChild(this.renderHeader());
        element.appendChild(this.renderBody());
        return element;
    }

    override renderBody(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify__body');
        element.appendChild(this.renderMessage());

        const actions = this.renderActions();
        if (actions) element.appendChild(actions);
        return element;
    }

    renderHeader(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify__header');

        const icon = this.renderIcon();
        if (icon) element.appendChild(icon);
        element.appendChild(this.renderTitle());

        const closeButton = this.renderCloseBtn();
        if (closeButton) {
            closeButton.addEventListener('click', () => this.unsetElement());
            element.appendChild(closeButton);
        }

        return element;
    }

    renderTitle(): HTMLElement {
        const element = document.createElement('div');
        element.classList.add('notify__title');
        element.textContent = this._options.title ?? 'Notification';
        return element;
    }
}
