import constants from "../../_shared/constants.js";
import UserDb from "../../_shared/userDb.js";
import LobbyController from "./utils/controller.js";
import LobbySocketBuilder from "./utils/lobbySocketBuilder.js";
import View from "./utils/view.js";

const user = UserDb.get();
if(!Object.keys(user).length) {
    View.redirectToLogin();
}

const socketBuilder = new LobbySocketBuilder({
    socketUrl: constants.socketUlr,
    namespace: constants.socketNamespaces.lobby
});

const dependencies = {
    socketBuilder,
    user,
    view: View
}

await LobbyController.initialize(dependencies).catch(e => {
    alert(e.message)
})



