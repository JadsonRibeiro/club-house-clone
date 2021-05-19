import Attendee from "../entities/attendee.js";
import Room from "../entities/room.js";
import constants from "../util/constants.js";

export default class RoomsController {
    #users = new Map();

    constructor() {
        this.rooms = new Map();
    }

    onNewConnection(socket) {
        console.log('Connection stablished with id ', socket.id);
        this.#updateGlobalUserData(socket.id);
    }

    joinRoom(socket, { user, room }) {
        console.log(`Usuário com ID ${socket.id} ingressou na sala ${room.id}`);
        const userId = user.id = socket.id;
        const roomId = room.id;

        const updatedUser = this.#updateGlobalUserData(userId, user, roomId);
        
        const updatedRoom = this.#joinUserRoom(socket, updatedUser, room);

        this.#notifyUsersOnRoom(socket, roomId, updatedUser);
        this.#replayWithActiveUsers(socket, updatedRoom.users);
    }

    disconnect(socket) {
        console.log(`Usuário com id ${socket.id} saiu...`);
        this.#logoutUser(socket);
    }

    #logoutUser(socket) {
        const userId = socket.id;
        const user = this.#users.get(userId);
        const roomId = user.roomId;
        // Remove usuário da lista de usuários ativo
        this.#users.delete(userId);

        // Caso seja um usuário sujeira que estava em uma sala que não existe mais
        if(!this.rooms.has(roomId)) {
            console.log(`A Sala com ID ${roomId} não existe`);
            return;
        }

        const room = this.rooms.get(roomId);
        const toBeRemoved = [...room.users].find(({ id }) => id === userId);
        
        // Remove usuário da sala
        room.users.delete(toBeRemoved);

        // Se não tiver mais nenhum usuário na sala, remove ela
        if(!room.users.size) {
            this.rooms.delete(roomId);
            return;
        }

        const disconnectedUserWasAnOwner = userId === room.owner.id;
        const onlyOneUserLeft = room.users.size === 1;

        // Validar se resta apenas um usuário na sala ou se usuário que saiu era o dono
        if(onlyOneUserLeft || disconnectedUserWasAnOwner) {
            room.owner = this.#getNewRoomOwner(room, socket);
        }

        this.rooms.set(roomId, room);

        socket.to(roomId).emit(constants.event.USER_DISCONNECTED, user);
    }

    #getNewRoomOwner(room, socket) {
        const users = [...room.users.values()];
        const activeSpeakers = users.find(user => user.isSpeaker);

        //Se quem desconectou era o dono, passa a liderança para o próximo
        //Se não houver speakers, ele pega o attendee mais antigo (primeira posição)
        const [newOwner] = activeSpeakers ? [activeSpeakers] : users;
        newOwner.isSpeaker = true;

        const outdatedUser = this.#users.get(newOwner.id);
        const updatedUser = new Attendee({
            ...outdatedUser,
            ...newOwner
        });

        this.#users.set(newOwner.id, updatedUser);

        this.#notifyuserProfileUpgrade(socket, room.id, newOwner)

        return newOwner;
    }

    #replayWithActiveUsers(socket, users) {
        const event = constants.event.LOBBY_UPDATED;
        socket.emit(event, [...users.values()]);
    }

    #notifyUsersOnRoom(socket, roomId, user) {
        const event = constants.event.USER_CONNECTED;
        socket.to(roomId).emit(event, user);
    }

    #notifyuserProfileUpgrade(socket, roomId, user) {
        socket.to(roomId).emit(constants.event.UPGRADE_USER_PERMISSION, user);
    }

    #joinUserRoom(socket, user, room) {
        const roomId = room.id;
        const existingRoom = this.rooms.has(roomId);
        const currentRoom = existingRoom ? this.rooms.get(roomId) : {};
        const currentUser = new Attendee({
            ...user,
            roomId
        });

        // Definindo o dono da sala
        const [owner, users] = existingRoom 
            ? [currentRoom.owner, currentRoom.users]
            : [currentUser, new Set()]

        const updatedRoom = this.#mapRoom({
            ...currentRoom,
            ...room,
            owner,
            users: new Set([...users, ...[currentUser]])
        });

        this.rooms.set(roomId, updatedRoom);

        socket.join(roomId);

        return this.rooms.get(roomId);
    }

    #mapRoom(room) {
        const users = [...room.users.values()];
        const speakersCount = users.filter(user => user.isSpeaker).length;
        const featuredAttendees = users.slice(0, 3);
        const mappedRoom = new Room({
            ...room,
            featuredAttendees,
            speakersCount,
            attendeesCount: room.users.size,
        });

        return mappedRoom;
    }

    #updateGlobalUserData(userId, userData = {}, roomId = '') {
        const user = this.#users.get(userId) ?? {};
        const existingRoom = this.rooms.has(roomId);

        const updatedUserData = new Attendee({
            id: userId,
            ...user,
            ...userData,
            roomId,
            isSpeaker: !existingRoom
        });

        this.#users.set(userId, updatedUserData);

        return this.#users.get(userId);
    }

    getEvents() {
        const functions = Reflect.ownKeys(RoomsController.prototype)
            .filter(functionName => functionName !== 'constructor')
            .map(functionName => [functionName, this[functionName].bind(this)])

        return new Map(functions);
    }
}