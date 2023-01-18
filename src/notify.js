export class Notifier {
    constructor(containerId = null) {
        this.container = containerId !== null ? document.getElementById(containerId)
            : document.getElementsByClassName('notify_queue')[0]
        console.log(this.container)
    }
    notify(options = {}) {
        new Notification(this.container, options)
    }
}
export class Notification {
    constructor(container, options = {}) {
        this.container = container
        this._element = document.createElement('div')
        this._element.classList.add('notification')
        if (options.classes) {
            if (typeof options.classes === 'string') this._element.classList.add(options.classes)
            else options.classes.forEach(cls => this._element.classList.add(cls))
        }
        requestAnimationFrame(() => {
            this._element.classList.add('show')
        })
        this._element.innerHTML = '<svg viewBox="0 0 24 24" class="notification-icon">'
            + '<path d="M14,2A8,8 0 0,0 6,10A8,8 0 0,0 14,18A8,8 0 0,0 22,10H20C20,13.32 17.32,16 14,16A6,6 0 0,1 8,10A6,6 0 0,1 14,4C14.43,4 14.86,4.05 15.27,4.14L16.88,2.54C15.96,2.18 15,2 14,2M20.59,3.58L14,10.17L11.62,7.79L10.21,9.21L14,13L22,5M4.93,5.82C3.08,7.34 2,9.61 2,12A8,8 0 0,0 10,20C10.64,20 11.27,19.92 11.88,19.77C10.12,19.38 8.5,18.5 7.17,17.29C5.22,16.25 4,14.21 4,12C4,11.7 4.03,11.41 4.07,11.11C4.03,10.74 4,10.37 4,10C4,8.56 4.32,7.13 4.93,5.82Z" />'
            + '</svg>'
        const message = document.createElement('span')
        message.classList.add('notification_message')
        message.innerHTML = options.message
        this._element.appendChild(message)
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.classList.add('notification_close')
        btn.innerHTML = '<svg viewBox="0 0 24 24">\n' +
            '                  <path  d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" />\n' +
            '                </svg>'
        btn.onclick = (function() {
            this.container.removeChild(this._element)
            console.log(1111)
        }).bind(this)
        this._element.appendChild(btn)

        this._duration = options.duration ?? 3000

        if (this._duration !== 0) {
            const progress = document.createElement('div')
            progress.classList.add('notification_progress')
            this._element.appendChild(progress)

            this._isPaused = false

            if (options.pauseOnHover ?? true) {
                this._element.onmouseover = () => this._isPaused = true
                this._element.onmouseleave = () => this._isPaused = false;
            }

            this._currentDuration = this._duration;
            this._interval = setInterval((function (){
                if (this._currentDuration === 0) {
                    this.close()
                } else {
                    if (this._isPaused) return
                    this._currentDuration -= 10
                    progress.style.width = `${this._currentDuration / this._duration * 100}%`
                }
            }).bind(this), 10)
        }
        this.container.appendChild(this._element)
    }

    close() {
        if (this._interval) clearTimeout(this._interval)
        this.container.removeChild(this._element)
    }
}
