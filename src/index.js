const path = require('path')
const http = require('http')
const express = require('express')
const sockeiio = require('socket.io')
const Filter = require('bad-words')
const { generateMsg, generateLocationMsg } = require('./utils/msgs.js')
const { users, addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')


const app = express()
const server = http.createServer(app)
const io = sockeiio(server)

const port = process.env.PORT || 3000;
const publicDirectoyPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoyPath))



io.on('connection', (socket) => {
    console.log('New NebSocket connection');

    socket.on('join', ({ username, room }, cb) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return cb(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMsg('Welcome', 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateMsg(`${user.username} has joined!`, 'Admin'))
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        cb()
    })

    socket.on('sendMessage', (value, cb) => {
        const user = getUser(socket.id)
        const filteredWords = new Filter()
        if (filteredWords.isProfane(value)) {
            return cb('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMsg(value, user.username));
        cb()
    })
    socket.on('sendLocation', (latLng, cb) => {
        if (!latLng) {
            return cb('lat and long are not valid');
        }
        const user = getUser(socket.id)
        const url = `https://www.google.com/maps?q=${latLng.latitude},${latLng.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMsg(url, user.username))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMsg(`${user.username} has left the room!`, 'Admin'))
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is listenning on port ${port}`)
})

