import constants from "../../../_shared/constants.js";
import Attendee from "../entities/attendee.js";

export default class RoomController {
    constructor({ roomInfo, socketBuilder, view, peerBuilder, roomService }) {
        this.roomInfo = roomInfo;
        this.socketBuilder = socketBuilder;
        this.view = view;
        this.peerBuilder = peerBuilder;
        this.roomService = roomService;

        this.socket = {};
        this.peer = {};
    }

    static async initialize(dependencies) {
        return new RoomController(dependencies)._initialize();
    }

    async _initialize() {
        this.roomService.init();
        
        this._setupView();
        this.socket = this._setupSocket();
        this.roomService.setCurrentPeer(await this._setupWebRTC());
    }

    _setupSocket() {
        return this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onDisconnected())
            .setOnRoomUpdated(this.onRoomUpdated())
            .setOnUserProfileUpgrade(this.onUserProfileUpgrade())
            .setOnSpeakRequested(this.onSpeakRequested())
            .build()
    }

    async _setupWebRTC() {
        return this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onCallReceived())
            .setOnCallError(this.onCallError())
            .setOnCallClose(this.onCallClose())
            .setOnStreamReceived(this.onStreamReceived())
            .build()
    }

    _setupView() {
        this.view.configureClapButton(this.onClapPressed());
        this.view.configureOnMicrophoneActivation(this.onMicrophoneActivation());
        this.view.configureLeaveButton();
        this.view.updateUserImage(this.roomInfo.user);
        this.view.updateRoomTopic(this.roomInfo.room);
    }

    onStreamReceived() {
        return (call, stream) => { 
            const callerId = call.peer;
            const { isCurrentId } = this.roomService.addReceivedPeer(call);
            this.view.renderAudioElement({
                callerId,
                stream,
                isCurrentId
            })
        };
    }

    onCallClose() {
        return call => { 
            console.log('onCallClose', call);
            const peerId = call.peer;
            this.roomService.disconnectPeer({ peerId });
        };
    }

    onCallError() {
        return (call, error) => { 
            console.log('onCallError', call, error);
            const peerId = call.peer;
            this.roomService.disconnectPeer({ peerId });
        };
    }

    onCallReceived() {
        return async call => { 
            const stream = await this.roomService.getCurrentStream();
            console.log('Respondendo a chamada...', call);
            call.answer(stream);
        };
    }

    onPeerError() {
        return error => console.log('Error', error);
    }

    onPeerConnectionOpened() {
        return (peer) => {
            console.log('Peer', peer);

            this.roomInfo.user.peerId = peer.id;

            // Só pede pra entrar na sala quando a conexão peer for estabilizada
            this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo);
        };
    }

    onUserProfileUpgrade() {
        return user => {
            console.log('Profile Upgraded', user);
            const attendee = new Attendee(user);
            
            if(attendee.isSpeaker) {
                this.roomService.upgradeUserPermission(attendee);
                this.view.addAttendeeOnGrid(attendee, true);
            }

            this.activateUserFeatures();
        };
    }

    onSpeakRequested() {
        return user  => {
            console.log('Alguém pediu para falar', user);

            const attendee = new Attendee(user);
            const result = prompt(`${attendee.username} pediu para falar!, aceitar? 1 sim, 0 não` );
            this.socket.emit(constants.events.SPEAK_ANSWER, { answer: !!Number(result), user: attendee });
        }
    }

    onClapPressed() {
        return () => {
            this.socket.emit(constants.events.SPEAK_REQUEST, this.roomInfo.user);
        };
    }

    onMicrophoneActivation() {
        return async () => {
            this.roomService.toggleAudioActivation();
        }
    }

    onRoomUpdated() {
        return data => {
            const users = data.map(user => new Attendee(user));

            this.roomService.updateCurrentUserProfile(users)
            this.view.updateAttendeesOnGrid(users);
            this.activateUserFeatures();

            console.log('Room list', users);
        };
    }

    onDisconnected() {
        return (user) => {
            const attendee = new Attendee(user);
            this.view.removeItemFromGrid(attendee.id);
            
            const peerId = attendee.peerId;
            this.roomService.disconnectPeer({ peerId });

            console.log(`${attendee.username} disconnected`);
        };
    }

    onUserConnected() {
        return (user) => {
            console.log('User connected', user)
            const attendee = new Attendee(user);
            this.view.addAttendeeOnGrid(attendee);

            // Quando um novo usuário se conectar, ligo para ele
            this.roomService.callNewUser(attendee);
        }
    }

    activateUserFeatures() {
        const currentUser = this.roomService.getCurrentUser();
        this.view.showUserFeatures(currentUser.isSpeaker);
    }
}