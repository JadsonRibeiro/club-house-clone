import constants from "../../_shared/constants.js"
import RoomController from "./util/controller.js";
import RoomSocket from "./util/roomSocket.js";
import View from "./util/view.js";

const urlParams = new URLSearchParams(window.location.search);
const keys = [ 'id', 'topic' ];

const urlData = keys.map(key => [key, urlParams.get(key)]);

const socketRoomBuilder = new RoomSocket({
    socketUrl: constants.socketUlr,
    namespace: constants.socketNamespaces.room
});

const user = {
    img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png',
    username: 'Jadson Ribeiro ' + Date.now()
}

const roomInfo = {
    room: {...Object.fromEntries(urlData)},
    user
}

const dependencies = {
    view: View,
    socketBuilder: socketRoomBuilder,
    roomInfo
}

RoomController.initialize(dependencies);