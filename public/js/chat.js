const socket = io()

// elements
const elMessageForm = document.querySelector('form')
const elMessageFormInput = elMessageForm.querySelector('input')
const elMessageFormBtn = elMessageForm.querySelector('button')

const elSendLocationBtn = document.querySelector('.send-location')

const elMessages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autocroll = () => {
    const elNewMessage = elMessages.lastElementChild
    const newMessageStyles = getComputedStyle(elNewMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = elNewMessage.offsetHeight + newMessageMargin
    console.log('newMessageMargin:', newMessageMargin);
    const visibleHeight = elMessages.offsetHeight

    const containerHeight = elMessages.scrollHeight

    const scrollOffset = elMessages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        elMessages.scrollTop = elMessages.scrollHeight
    }

}


socket.on('message', (message) => {
    // console.log(`${message}`);
    const html = Mustache.render(messageTemplate, {
        message: message.txt,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    elMessages.insertAdjacentHTML('beforeend', html)
    autocroll()
})


socket.on('locationMessage', (msg) => {
    const html = Mustache.render(locationTemplate, {
        url: msg.url,
        username: msg.username,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    elMessages.insertAdjacentHTML('beforeend', html)
    autocroll()
})

elMessageForm.addEventListener('submit', (ev) => {
    ev.preventDefault()

    elMessageFormBtn.setAttribute('disabled', 'disabled')

    const message = ev.target.elements.message.value
    socket.emit('sendMessage', message, (err) => {
        elMessageFormBtn.removeAttribute('disabled')
        elMessageFormInput.value = ''
        elMessageFormInput.focus()
        if (err) {
            return console.log(err);
        }
        return console.log('The message was delivered');
    })
})

socket.on('roomData', ({ room, users }) => {
    const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
    const html = Mustache.render(sidebarTemplate, { room, users })
    document.querySelector('#sidebar').innerHTML = html

})



elSendLocationBtn.addEventListener('click', () => {
    elSendLocationBtn.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not cupported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        const latLng = { latitude, longitude }
        socket.emit('sendLocation', latLng, (err) => {
            elSendLocationBtn.removeAttribute('disabled')
            if (err) {
                return console.log(err);
            }
            return console.log('Location was delivered');
        })
    })
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})