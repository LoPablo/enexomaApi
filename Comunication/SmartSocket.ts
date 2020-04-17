//SmartSocket.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//TLS Socket Wrapper to handle all types of
//events occurring and passing on received data
//--------------------------------------------------

import Deffered from '../Helpers/Deffered';
import * as tls from "tls";
import DataDelegateInterface from "./DataDelegateInterface";
import {factory} from "../Helpers/Logger";
import JSONCommand from "./Model/JSONCommand";
import JSONResponse from "./Model/JSONResponse";
import {PeerCertificate} from "tls";
import CommandFactory from "./CommandFactory";

const log = factory.getLogger("Communication.SmartSocket");

export default class SmartSocket {

    private ipAddress: string;
    private port: number;
    private certText: string;

    private internalSocket?: tls.TLSSocket;
    private dataDelegate?: DataDelegateInterface;
    private tempByteChunk: string;
    private keepAliveHandler?: ReturnType<typeof setInterval>;


    constructor(ipAddress: string, port: number, certText: string) {
        this.ipAddress = ipAddress;
        this.certText = certText;
        this.port = port;
        this.tempByteChunk = '';
        log.debug("Constructor finished");
    }

    public setDelegate(dataDelegate: DataDelegateInterface) {
        this.dataDelegate = dataDelegate
    }

    public setupSocket(dataDelegate?: DataDelegateInterface): Promise<void> {
        log.debug("Setting Up Socket")
        const socketOptions: tls.ConnectionOptions = {
            timeout: 10000,
            minVersion: 'TLSv1',
            host: this.ipAddress,
            port: this.port,
            ca: this.certText,
            rejectUnauthorized: true,
            checkServerIdentity: (host: string, cert: PeerCertificate): Error | any => {
                log.debug('Cert issuer Organization: ' + cert.issuer.O)
            }

        };
        return new Promise((resolve, reject) => {
            if (dataDelegate) {
                this.dataDelegate = dataDelegate;
            }
            this.internalSocket = tls.connect(socketOptions, () => {
                if (this.internalSocket) {
                    this.internalSocket.on('error', (err) => {
                        log.error("Setup connection error" + err.toString());
                        setImmediate(() => {
                            if (this.dataDelegate) {
                                this.dataDelegate.handleDisconnect();
                            }
                        });
                    });
                    if (!this.internalSocket.authorized) {
                        log.error("Setup connection not authorized with Error: " + this.internalSocket.authorizationError);
                        reject(this.internalSocket.authorizationError.toString());
                    } else {
                        this.internalSocket.setEncoding('utf8');
                        this.setupSocketEvents();
                        log.debug("Setup Socket successfully");
                        resolve();
                    }
                }


            })
                .on('error', (err) => {
                    log.error("Error occured: " + err.toString());
                    reject(err.toString());
                });
        });
    }

    setupSocketEvents() {
        log.debug("Setting up Socket-Events");
        if (this.internalSocket) {
            this.internalSocket.on('data', (data) => {
                if (data.indexOf('\n') < 0) {
                    this.tempByteChunk += data.toString();
                } else {
                    this.tempByteChunk += data.toString();
                    let tempSplit = this.tempByteChunk.split("\n");
                    for (var tempSplitString of tempSplit) {
                        if (tempSplitString !== "") {
                            log.debug("Recieved Data: " + tempSplitString);
                            if (this.dataDelegate) {
                                this.dataDelegate.handleMessage(tempSplitString);
                            }
                        }
                    }
                    this.tempByteChunk = '';
                }
            });
            this.internalSocket.on('timeout', () => {
                log.debug("Socket timed out");
                setTimeout(() => {
                    //this.renewSocket()
                }, 0);
            });
            this.internalSocket.on('end', () => {
                log.debug("Socket ended");
                setImmediate(() => {
                    if (this.dataDelegate) {
                        this.dataDelegate.handleDisconnect();
                    }
                });
            });
            this.internalSocket.on('close', () => {
                log.debug("Socket closed");
                setImmediate(() => {
                    if (this.dataDelegate) {
                        this.dataDelegate.handleDisconnect();
                    }
                });
            });
        }
    }

    public startKeepAlive() {
        this.keepAliveHandler = setInterval(() => {
            this.sendJSONCommand(CommandFactory.createKeepAliveCmd())
        }, 5000);
    }

    public stopKeepAlive() {
        if (this.keepAliveHandler) {
            clearInterval(this.keepAliveHandler);
        }
    }

    //only sending command without waiting for response in the local MessageHandler.
    // Does not resolve when send fails.
    //be advised, that a may occurring response is discarded and may result in an error
    sendJSONCommand(command: JSONCommand, sessionkey?: string): Deffered<void> {
        log.debug("Sending Command with methode: " + command.command)
        const localPromise = new Deffered<void>((resolve, reject) => {
            if (this.internalSocket && command) {
                log.debug("Send JSON: " + command.toString());
                this.internalSocket.write(command.toString());
                this.internalSocket.write('\n');
                resolve();
            } else {
                log.debug("Error sending command. Check Socket or JSONCommand")
                reject("Something went wrong");
            }
        });
        return localPromise;
    }

    //sends command and waits for receive in the promise queue of the message handler
    //don't know if the output socket of the gateway is in-order, so maybe there needs
    //to be some checking
    sendAndRecieveCommand(command: JSONCommand, sessionkey?: string): Deffered<JSONResponse> {
        const localPromise = new Deffered<JSONResponse>((resolve, reject) => {
            if (this.internalSocket && command) {
                log.debug("Send and Recieve JSON: " + command.toString(sessionkey));
                this.internalSocket.write(command.toString(sessionkey));
                this.internalSocket.write('\n');
            } else {
                reject();
            }
        });
        if (this.dataDelegate) {
            this.dataDelegate.queueUpPromise(localPromise);
        }
        return localPromise;
    }

}

module.exports = SmartSocket;
