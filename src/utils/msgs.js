const generateMsg = (txt, username = 'User') => {
    return {
        txt,
        username,
        createdAt: new Date().getTime()
    }
}
const generateLocationMsg = (url, username = 'User') => {
    return {
        url,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMsg,
    generateLocationMsg
}