import constants from "../../_shared/constants.js"
import RoomSocket from "./util/roomSocket.js";

const socketRoomBuilder = new RoomSocket({
    socketUrl: constants.socketUlr,
    namespace: constants.socketNamespaces.room
});

const socket = socketRoomBuilder
    .setOnUserConnected((user) => console.log('User connected', user))
    .setOnUserDisconnected((user) => console.log('User disconnected', user))
    .setOnRoomUpdated(room => console.log('Room list', room))
    .build()

const room = {
    id: '001',
    topic: 'JS Expert eh noix'
}

const user = {
    img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png',
    username: 'Jadson Ribeiro ' + Date.now()
}

socket.emit(constants.events.JOIN_ROOM, { user, room });