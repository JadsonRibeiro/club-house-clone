import constants from "../../../_shared/constants.js";
import SocketBuilder from "../../../_shared/socketBuilder.js";

export default class RoomSocket extends SocketBuilder {
    constructor({ socketUrl, namespace }) {
        super({socketUrl, namespace});
        this.onRoomUpdated = () => {};
        this.onUserProfileUpgrade = () => {};
    }

    setOnRoomUpdated(fn) {
        this.onRoomUpdated = fn;

        return this;
    }

    setOnUserProfileUpgrade(fn) {
        this.onUserProfileUpgrade = fn;

        return this;
    }

    build() {
        const socket = super.build();

        socket.on(constants.events.LOBBY_UPDATED, this.onRoomUpdated);
        socket.on(constants.events.UPGRADE_USER_PERMISSION, this.onUserProfileUpgrade);

        return socket;
    }
}