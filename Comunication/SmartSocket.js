//SmartSocket.js
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//TLS Socket Wrapper to handle all types of
//events occurring and passing on received data
//--------------------------------------------------

const Deffered = require('../Helpers/Deffered');
const Tls = require('tls');


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
        this.logService.debug("Constructor finished", this);
    }

    setupSocket(inMessageHandler) {
        const socketOptions = {
            timeout: 10000,
            minVersion: 'TLSv1',
            host: this.config.host,
            port: this.config.port,
            ca: this.config.certificate,
            rejectUnauthorized: false,
            checkServerIdentity: function (host, cert) {
                //console.log(cert);
            }
        };
        this.logService.debug("Setup with socketOptions: " + JSON.stringify(socketOptions), this);
        this.handler = inMessageHandler;

        return new Promise((resolve, reject) => {

            this.connection = Tls.connect(socketOptions, () => {
                this.connection.on('error', (err) => {
                    this.logService.error(err, this);
                    setImmediate(() => {
                        if (typeof this.handler !== 'undefined' && this.handler) {
                            this.handler.disconnectHandler();
                        }
                    });
                });
                if (!this.connection.authorized) {
                    this.logService.error("Setup connection not authorized with Error: " + this.connection.authorizationError, this);
                    reject('Setup connection not authorized with Error: ' + this.connection.authorizationError);
                } else {
                    this.connection.setEncoding('utf8');
                    this.setupSocketEvents();
                    this.logService.debug("Setup finished successfully", this);
                    resolve();
                }
            })
                .on('error', (err) => {
                    this.logService.error(err, this);
                    reject(err);
                });
        });
    }

    setupSocketEvents() {
        this.logService.debug("Setup socket Event", this);
        this.connection.on('data', (data) => {
            if (data.indexOf('\n') < 0) {
                this.tempChunk += data;
            } else {
                this.tempChunk += data;
                let tempSplit = this.tempChunk.split("\n");
                for (var tempSplitString of tempSplit) {
                    if (tempSplitString !== "") {
                        this.logService.debug("Recieved Data: " + tempSplitString, this);
                    }
                    if (typeof this.handler !== 'undefined' && this.handler) {
                        this.handler.handleMainMessage(tempSplitString);
                    }
                }
                this.tempChunk = '';
            }
        });
        this.connection.on('timeout', () => {
            setTimeout(() => {
                this.logService.error("Socket Timeout", this);
                self.renewSocket()
            }, 0);
        });
        this.connection.on('end', () => {
            this.logService.debug("Socket End", this);
            setImmediate(() => {
                if (typeof this.handler !== 'undefined' && this.handler) {
                    this.handler.disconnectHandler();
                }
            });
        });
        this.connection.on('close', () => {
            this.logService.debug("Socket Close", this);
            setImmediate(() => {
                if (typeof this.handler !== 'undefined' && this.handler) {
                    this.handler.disconnectHandler();
                }
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
                this.logService.debug("Send Command: " + command.toString(), this);
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
                this.logService.debug("Send and Recieve Command: " + command.toString(sessionkey), this);
                instance.connection.write(command.toString(sessionkey));
                instance.connection.write('\n');
            } else {
                reject();
            }
        });
        if (typeof this.handler !== 'undefined' && this.handler) {
            this.handler.queueUpPromise(localPromise);
        }
        return localPromise;
    }
}

module.exports = SmartSocket;
