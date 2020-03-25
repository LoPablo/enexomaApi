//KeepAliveService.js
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//periodic sending a keep alive command, the App and
//Java App is doing this dont know if it is needed
//--------------------------------------------------

const CommandFactory = require('../Comunication/CommandFactory');

class KeepAliveService {

    constructor(inSmartSocket) {
        this.smartSocket = inSmartSocket;
        this.keepAliveHandler = null;
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