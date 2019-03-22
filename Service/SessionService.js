const CommandFactory = require('../Comunication/CommandFactory');
const LoginHelper = require("../Helpers/LoginHelper");

class SessionService {
    constructor(inSmartSocket, inSessionConfig) {
        this.smartSocket = inSmartSocket;
        this.sessionConfig = inSessionConfig;
        this.salt = null;
        this.sessionSalt = null;
        this.sessionID = null;
        this.deviceInfo = null;
    }

    requestSession() {
        const instance = this;
        return new Promise((resolve, reject) => {
            instance.smartSocket.sendAndRecieveCommand(CommandFactory.createHeloCmd(instance.sessionConfig.username))
                .catch((error) => {
                    reject(error);
                }).then((data) => {
                let digest = LoginHelper.calculateDigest(instance.sessionConfig.password, data.salt, data.sessionSalt);
                return instance.smartSocket.sendAndRecieveCommand(CommandFactory.createLoginCmd(instance.sessionConfig.username, digest, instance.sessionConfig.cSymbol + instance.sessionConfig.cSymbolAddon, instance.sessionConfig.shcVersion, instance.sessionConfig.shAPIVersion))
            }).catch((error) => {
                reject(error);
            }).then((data) => {
                console.log(data);
                return instance.parseLoginMessage(data);
            }).catch((error) => {
                reject(error);
            }).then(() => {
                resolve();
            });
        });
    }

    parseLoginMessage(inMessage) {
        const instance = this;
        return new Promise((resolve, reject) => {
            instance.deviceInfo = inMessage;
            if (inMessage.sessionID) {
                instance.sessionID = inMessage.sessionID;
                resolve();
            } else {
                reject('Missing sessionID')
            }
        });
    }
}

module.exports = SessionService;
