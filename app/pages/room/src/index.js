import constants from "../../_shared/constants.js"
import Media from "../../_shared/media.js";
import PeerBuilder from "../../_shared/peerBuilder.js";
import RoomController from "./util/controller.js";
import RoomSocket from "./util/roomSocket.js";
import RoomService from "./util/service.js";
import View from "./util/view.js";

const urlParams = new URLSearchParams(window.location.search);
const keys = [ 'id', 'topic' ];

const urlData = keys.map(key => [key, urlParams.get(key)]);

const peerBuilder = new PeerBuilder({ peerConfig: constants.peerConfig});

const socketRoomBuilder = new RoomSocket({
    socketUrl: constants.socketUlr,
    namespace: constants.socketNamespaces.room
});

const roomService = new RoomService({
    media: Media
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
    roomInfo,
    peerBuilder,
    roomService
}

RoomController.initialize(dependencies).catch(e => {
    alert(e.message)
})