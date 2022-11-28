const logger = require('./logger.service')

const EVENTS = {
    SOCKET_EVENT_SEND_MSG: 'chat-send-msg',
    SOCKET_EVENT_SET_TOPIC: 'chat-set-topic',
    SOCKET_EVENT_USER_WATCH: 'user-watch',
    SOCKET_EVENT_SET_USER_SOCKET: 'set-user-socket',
    SOCKET_EVENT_UNSET_USER_SOCKET: 'unset-user-socket'
}

const EMITS = {
    SOCKET_EMIT_ADD_MSG: 'chat-add-msg',
    SOCKET_EMIT_REVIEW_ADDED: 'review-added',
    SOCKET_EMIT_REVIEW_REMOVED: 'review-removed'
}

var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })

    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })

        socket.on(EVENTS.SOCKET_EVENT_SET_TOPIC, topic => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)
            }

            socket.join(topic)
            socket.myTopic = topic
        })

        socket.on(EVENTS.SOCKET_EVENT_SEND_MSG, msg => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
            const msgWithFN = {
                id: 'd-' + Date.now(),
                fullname: socket.fullname || 'Guest',
                txt: msg
            }

            gIo.to(socket.myTopic).emit(EMITS.SOCKET_EMIT_ADD_MSG, msgWithFN)
        })

        socket.on(EVENTS.SOCKET_EVENT_USER_WATCH, userId => {
            logger.info(`user-watch from socket [id: ${socket.id}], on user ${userId}`)
            socket.join('watching:' + userId)
        })

        socket.on(EVENTS.SOCKET_EVENT_SET_USER_SOCKET, ({ _id: userId, fullname }) => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId
            socket.fullname = fullname
        })

        socket.on(EVENTS.SOCKET_EVENT_UNSET_USER_SOCKET, () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            delete socket.userId
        })
    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    userId = userId.toString()
    const socket = await _getUserSocket(userId)

    if (socket) {
        logger.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        socket.emit(type, data)
    } else {
        logger.info(`No active socket for user: ${userId}`)
        // _printSockets()
    }
}

// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString()

    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    console.log('excludedSocket', excludedSocket)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
    emits: EMITS,
    events: EVENTS
}
