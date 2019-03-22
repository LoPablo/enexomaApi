const Command = require('./Command');
const Deffered = require('../Helpers/Deffered');
const FileSystem = require('fs');
const Tls = require('tls');

let defaultConfig = {
    host: 'SH1-Box.local',
    port: '4300',
    certificate: FileSystem.readFileSync('./Comunication/CA.pem')
};

class SmartSocket {

    constructor(inConfig, inLogService) {
        this.logService = inLogService;
        if (inConfig) {
            this.config = inConfig;
        } else {
            this.config = defaultConfig;
        }
        this.connection = null;
        this.handler = null;
        this.tempChunk = '';
    }

    setupSocket(inMessageHandler) {
        const socketOptions = {
            timeout: 10000,
            host: this.config.host,
            port: this.config.port,
            ca: this.config.certificate,
            rejectUnauthorized: false,
            checkServerIdentity: function (host, cert) {
                //console.log(cert);
            }
        };
        this.handler = inMessageHandler;
        return new Promise((resolve, reject) => {
            this.connection = Tls.connect(socketOptions, () => {
                if (!this.connection.authorized) {
                    reject('Connection not authorized');
                } else {
                    this.connection.setEncoding('utf8');
                    this.setupSocketEvents();
                    resolve();
                }
            });
            this.connection.on('apiError', (err) => {
                reject(err);
                this.logService.error(err);
            });
        });
    }

    setupSocketEvents() {
        this.connection.on('data', (data) => {
            if (data.indexOf('\n') < 0) {
                this.tempChunk += data;
            } else {
                this.tempChunk += data;
                let tempSplit = this.tempChunk.split("\n");
                for (var tempSplitString of tempSplit) {
                    this.handler.handleMainMessage(tempSplitString);
                }
                this.tempChunk = '';
            }
        });
        this.connection.on('timeout', () => {
            setTimeout(() => {
                self.renewSocket()
            }, 0);
        });
        this.connection.on('apiError', (err) => {
            setImmediate(() => {
                this.handler.disconnectHandler();
            });
        });
        this.connection.on('end', () => {
            setImmediate(() => {
                this.handler.disconnectHandler();
            });
        });
        this.connection.on('close', () => {
            setImmediate(() => {
                this.handler.disconnectHandler();
            });
        });
    }

    //only sending command without waiting for response in the local MessageHandler.
    // Does not resolve when send fails.
    //be advised, that a may occurring response is discarded and may result in an error
    sendCommand(command, sessionkey) {
        const instance = this;
        const localPromise = new Deffered((resolve, reject) => {
            if (instance.connection && command) {
                //console.log(command.toString(sessionkey));
                instance.connection.write(command.toString());
                instance.connection.write('\n');
                resolve();
            } else {
                reject();
            }
        });
    }

    //sends command and waits for receive in the promise queue of the message handler
    //don't know if the output socket of the gateway is in-order, so maybe there needs
    //to be some checking
    sendAndRecieveCommand(command, sessionkey) {
        const instance = this;
        const localPromise = new Deffered((resolve, reject) => {
            if (instance.connection && command) {
                //console.log(command.toString(sessionkey));
                instance.connection.write(command.toString(sessionkey));
                instance.connection.write('\n');
            } else {
                reject();
            }
        });
        this.handler.queueUpPromise(localPromise);
        return localPromise;
    }

}

module.exports = SmartSocket;
