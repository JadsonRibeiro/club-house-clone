import constants from "../util/constants.js";

export default class LobbyController {
    constructor({ activeRooms, roomsListener }) {
        this.activeRooms = activeRooms;
        this.roomsListener = roomsListener;
    }

    onNewConnection(socket) {
        const { id } = socket;
        console.log('[Lobby] Connection stabilished with socket ', id)
        this.#updateLobbyRooms(socket, [...this.activeRooms.values()]);

        this.#activateEventProxy(socket);
    }

    #activateEventProxy(socket) {
        this.roomsListener.on(constants.event.LOBBY_UPDATED, rooms => {
            this.#updateLobbyRooms(socket, rooms);
        })
    }

    #updateLobbyRooms(socket, activeRooms) {
        socket.emit(constants.event.LOBBY_UPDATED, activeRooms);
    }

    getEvents() {
        const functions = Reflect.ownKeys(LobbyController.prototype)
            .filter(functionName => functionName !== 'constructor')
            .map(functionName => [functionName, this[functionName].bind(this)])

        return new Map(functions);
    }
}