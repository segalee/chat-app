const users = []

const addUser = ({ id, username, room }) => {
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    //findindex is faster and more efficient
    // because it stops running after it finds a match
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
    // const filteredUsers = users.filter((user) => {
    //     return user.id !== id
    // })
    // users = filteredUsers
}


const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
    // let usersInRoom = []
    // users.forEach((user) => {
    //     if (user.room === room) {
    //         usersInRoom.push(user)
    //     }
    // })
    // return usersInRoom
    room = room.trim().toLowerCase()
    return users.filter((user) => {
        return user.room === room
    })
}


module.exports = {
    users,
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}