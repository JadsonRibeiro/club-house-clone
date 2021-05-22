import UserStream from './../entities/userStream.js';

export default class RoomService {
    constructor({ media }) {
        this.media = media;

        this.currentUser = {};
        this.currentPeer = {};
        this.currentStream = {};

        this.isAudioActive = true;

        this.peers = new Map();
    }

    init() {
        this.currentStream = new UserStream({
            stream: this.media.getUserAudio(),
            isFake: false
        })
    }

    setCurrentPeer(currentPeer) {
        this.currentPeer = currentPeer;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    upgradeUserPermission(user) {
        if(!user.isSpeaker) return;

        const isCurrentUser = user.id === this.currentUser.id;
        if(!isCurrentUser) return;

        this.currentUser = user;

        return this._reconnectAsSpeaker();
    }

    async updateCurrentUserProfile(users) {
        console.log('Users', users)
        this.currentUser = users.find(({ peerId }) => peerId === this.currentPeer.id);
    }

    async getCurrentStream() {
        const { isSpeaker } = this.currentUser;
        if(isSpeaker) {
            return this.currentStream.stream;
        }

        return this.media.createMediaStreamFake()
    }

    toggleAudioActivation() {
        this.isAudioActive = !this.isAudioActive;
        this.switchAudioStreamSource({ realAudio: this.isAudioActive })
    }

    async _reconnectAsSpeaker() {
        return this.switchAudioStreamSource({ realAudio: true });
    }

    _reconnectPeers(stream) {
        for(const peer of this.peers.values()) {
            const peerId = peer.call.peer;
            peer.call.close();
            console.log('Calling to', peerId);

            this.currentPeer.call(peerId, stream);
        }
    }

    async switchAudioStreamSource({ realAudio }) {
        const userAudio = realAudio
            ? await this.media.getUserAudio()
            : this.media.createMediaStreamFake()

        this.currentStream = new UserStream({
            isFake: realAudio,
            stream: userAudio
        });

        this.currentUser.isSpeaker = realAudio;

        // Precisa encerrar as chamadas para ligar novamente
        this._reconnectPeers(this.currentStream.stream);
    }

    addReceivedPeer(call) {
        const callId = call.peer;
        this.peers.set(callId, { call });

        const isCurrentId = callId === this.currentPeer.id;
        return { isCurrentId };
    }

    disconnectPeer({ peerId }) {
        if(!this.peers.has(peerId)) 
            return;

        this.peers.get(peerId).call.close();
        this.peers.delete(peerId);
    }

    async callNewUser(user) {
        // Quem liga são os speakers
        const { isSpeaker } = this.currentUser;
        if(!isSpeaker)
            return;

        const stream = await this.getCurrentStream();
        this.currentPeer.call(user.peerId, stream);
        
    }
}