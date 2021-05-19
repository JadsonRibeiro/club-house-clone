import constants from "../../../_shared/constants.js";
import Attendee from "../entities/attendee.js";

export default class RoomController {
    constructor({ roomInfo, socketBuilder, view }) {
        this.roomInfo = roomInfo;
        this.socketBuilder = socketBuilder;
        this.view = view;

        this.socket = {};
    }

    static async initialize(dependencies) {
        return new RoomController(dependencies)._initialize();
    }

    async _initialize() {
        this.socket = this._setupSocket();
        this._setupView();

        this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo);
    }

    _setupSocket() {
        return this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onDisconnected())
            .setOnRoomUpdated(this.onRoomUpdated())
            .setOnUserProfileUpgrade(this.onUserProfileUpgrade())
            .build()
    }

    onUserProfileUpgrade() {
        return user => {
            console.log('Profile Upgraded', user);
            const attendee = new Attendee(user);
            if(attendee.isSpeaker) {
                this.view.addAttendeeOnGrid(attendee, true);
            }
        };
    }

    _setupView() {
        this.view.updateUserImage(this.roomInfo.user);
        this.view.updateRoomTopic(this.roomInfo.room);
    }

    onRoomUpdated() {
        return room => {
            console.log('Room list', room)
            this.view.updateAttendeesOnGrid(room);
        };
    }

    onDisconnected() {
        return (user) => {
            const attendee = new Attendee(user);
            this.view.removeItemFromGrid(attendee.id);
            
            console.log(`${attendee.username} disconnected`);
        };
    }

    onUserConnected() {
        return (user) => {
            console.log('User connected', user)
            const attendee = new Attendee(user);
            this.view.addAttendeeOnGrid(attendee);
        }
    }
}