### Install
```bash
npm i notifys
```
### Base usage

```js
import {Notifier} from 'notify';

const notifier = new Notifier('top-center')

notifier.error('Whoops. An error occurred.')
```
### Extended usage
```js
notifier.error({
    title: 'Error',
    message: '<span class="accent">Whoops.</span> An error occurred.',
    pauseOnHover: true,
    duration: 5000, // set to 0 to show notifications indefinitely
    expand: true, // render expanded notification template
    showProgress: true,
    appearAnimation: 'backInLeft',
    disappearAnimation: 'backOutLeft',
    renderActions:  function (close) {
        const el = document.createElement('div')
        el.classList.add('notify__actions')

        const btn1 = document.createElement('button')
        btn1.classList.add('btn-outline')
        btn1.innerText = 'Ok, i got it'

        const btn2 = document.createElement('button')
        btn2.classList.add('btn-text')
        btn2.innerText = 'Maybe later'

        btn1.onclick = close
        btn2.onclick = close

        el.appendChild(btn1)
        el.appendChild(btn2)

        return el
    }
})
```
### Fire custom notification
```js
const notification = new Notification({
    classes: 'my-custom-notify',
    duration: 0
})
notifier.notify(notification)
```
### Manipulate notifications queue
```js
notifier.setPosition('top-left') // set the position for the notification queue.
// Optionally one of the following values: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
notifier.removeFirst() // remove first notification
notifier.removeLast() // remove last notification
notifier.removeAll() // remove all notification
```

### Notifications methods
```js
notifier.info('Fire info notification template') 
notifier.error('Fire error notification template') 
notifier.warning('Fire warning notification template')
notifier.success('Fire success notification template')
notifier.simple('Fire base notification template')
```

### Notification animations 
Set the values of the appearAnimation/disappearAnimation properties of the options object to one of the animation classes provided by [animate.css](https://animate.style/) without the animate__ prefix

### Demo
https://shelamkoff.github.io/notify/
