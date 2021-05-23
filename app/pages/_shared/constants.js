const constants = {
    socketUlr: 'http://localhost:3000',
    // socketUlr: 'https://clubhouse-server.herokuapp.com',
    socketNamespaces: {
        room: 'room',
        lobby: 'lobby'
    },
    peerConfig: Object.values({
        id: undefined,
        config: {
            // host: 'clubhouse-peer.herokuapp.com',
            // secure: true,
            // path: '/',
            port: 9000,
            host: 'localhost',
            path: '/'
        }
    }),
    pages: {
        lobby: '/pages/lobby',
        login: '/pages/login',
    },
    events: {
        USER_CONNECTED: 'userConnection',
        USER_DISCONNECTED: 'userDisconnection',

        JOIN_ROOM: 'joinRoom',

        LOBBY_UPDATED: 'lobbyUpdated',
        UPGRADE_USER_PERMISSION: 'upgradeUserPermission',

        SPEAK_REQUEST: 'speakRequest',
        SPEAK_ANSWER: 'speakAnswer'
    },
    firebaseConfig: {
        apiKey: "***",
        authDomain: "***",
        projectId: "***",
        storageBucket: "***",
        messagingSenderId: "***",
        appId: "***"
    },
    storageKey: 'jsexpert:storage:user'
}

export default constants;