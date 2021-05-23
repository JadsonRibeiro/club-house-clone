import constants from "../../_shared/constants.js"
import Media from "../../_shared/media.js";
import PeerBuilder from "../../_shared/peerBuilder.js";
import UserDb from "../../_shared/userDb.js";
import RoomController from "./util/controller.js";
import RoomSocket from "./util/roomSocket.js";
import RoomService from "./util/service.js";
import View from "./util/view.js";

const user = UserDb.get();
if(!Object.keys(user).length) {
    View.redirectToLogin();
}

const urlParams = new URLSearchParams(window.location.search);
const keys = [ 'id', 'topic' ];

const urlData = keys.map(key => [key, urlParams.get(key)]);

const peerBuilder = new PeerBuilder({ peerConfig: constants.peerConfig });

const socketRoomBuilder = new RoomSocket({
    socketUrl: constants.socketUlr,
    namespace: constants.socketNamespaces.room
});

const roomService = new RoomService({
    media: Media
});

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