const CommandFactory = require('../Comunication/CommandFactory');

class KeepAliveService {

    constructor(inSmartSocket) {
        this.smartSocket = inSmartSocket;
        this.keepAliveHandler = null;
        this.keepUpToDateHandler = null;
    }

    startKeepAlive() {
        const instance = this;
        this.keepAliveHandler = setInterval(() => {
            instance.smartSocket.sendCommand(CommandFactory.createKeepAliveCmd());
        }, 5000);
    }

    stopKeepAlive() {
        clearInterval(this.keepAliveHandler);
    }
}

module.exports = KeepAliveService;