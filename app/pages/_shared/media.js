export default class Media {
    static async getUserAudio(audio = true) {
        return navigator.mediaDevices.getUserMedia({
            audio
        })
    }

    // Será utilizado pelos usuários que não serão speakers
    // Gera um stream onde não se envia áudio, mas permite ouvir outros 
    static createMediaStreamFake() {
        return new MediaStream([
            Media._createEmptyAudioTrack()
        ])
    }

    static _createEmptyAudioTrack() {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = oscillator.connect(audioContext.createMediaStreamDestination());
        oscillator.start();
        const [track] = destination.stream.getAudioTracks();

        return Object.assign(track, { enabled: false });
    }
}

// https://youtu.be/eTf40B_z2ls?t=4005