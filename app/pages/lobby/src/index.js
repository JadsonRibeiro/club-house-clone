import constants from "../../_shared/constants.js";
import LobbyController from "./utils/controller.js";
import LobbySocketBuilder from "./utils/lobbySocketBuilder.js";
import View from "./utils/view.js";

const socketBuilder = new LobbySocketBuilder({
    socketUrl: constants.socketUlr,
    namespace: constants.socketNamespaces.lobby
});

const user = {
    img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png',
    username: 'Jadson Ribeiro ' + Date.now()
}

const dependencies = {
    socketBuilder,
    user,
    view: View
}

await LobbyController.initialize(dependencies);



