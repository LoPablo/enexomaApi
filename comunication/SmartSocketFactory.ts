//SmartSocketFactory.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

import SmartSocket from "./SmartSocket";
import fs from "fs";
import DataDelegateInterface from "./DataDelegateInterface";
import CommandFactory from "./CommandFactory";
import HashHelper from "./HashHelper";
import HeloResponse from "./comModel/responseBody/HeloResponse";
import LoginResponse from "./comModel/responseBody/LoginResponse";

export default class SmartSocketFactory {

    static createSocketAndLogin(ipAddress: string, port: number, caPath: string, username: string, password: string, cSymbol: string, shcVersion: string, shApiVersion: string, dataHandler?: DataDelegateInterface, startKeepAlive?: Boolean): Promise<SmartSocket> {
        var returnPromise: Promise<SmartSocket> = new Promise((resolve, reject) => {
            if (dataHandler) {
                this.createSocket(ipAddress, port, caPath, dataHandler)
                    .catch(reason => {
                        reject(reason)
                    })
                    .then(socket => {
                        if (socket) {
                            socket.sendAndRecieveCommand(CommandFactory.createHeloCmd(username))
                                .then(responseHelo => {

                                    if (responseHelo.response) {
                                        let parsedResponseHelo: HeloResponse = HeloResponse.fromObject(responseHelo.response);
                                        if (parsedResponseHelo && parsedResponseHelo.salt && parsedResponseHelo.sessionSalt) {
                                            let digest = HashHelper.calculateDigest(password, parsedResponseHelo.salt, parsedResponseHelo.sessionSalt);
                                            socket.sendAndRecieveCommand(CommandFactory.createLoginCommand(username, digest, cSymbol, shcVersion, shApiVersion))
                                                .then(responseLogin => {
                                                    if (responseLogin.response) {
                                                        let parsedResponseLogin: LoginResponse = LoginResponse.fromObject(responseLogin.response)
                                                        if (parsedResponseLogin && parsedResponseLogin.sessionID) {
                                                            dataHandler.handleLoginMessage(parsedResponseLogin);
                                                            if (startKeepAlive) {
                                                                socket.startKeepAlive();
                                                            }
                                                            resolve(socket);
                                                        } else {
                                                            reject("JSON Parsing Message Error 4");
                                                        }
                                                    } else {
                                                        reject("JSON Parsing Message Error 3");
                                                    }
                                                })
                                                .catch((reason) => {
                                                    reject(reason);
                                                })
                                        } else {
                                            reject("JSON Parsing Message Error 2");
                                        }
                                    } else {
                                        reject("JSON Parsing Message Error 1");
                                    }
                                })
                                .catch(reason => {
                                    reject(reason);
                                })
                        }
                    });

            } else {
                reject("Missing dataHandler. Needed for Login.")
            }
        });
        return returnPromise;
    }

    static createSocket(ipAddress: string, port: number, caPath: string, dataHandler?: DataDelegateInterface): Promise<SmartSocket> {
        var caText: string = fs.readFileSync(caPath, 'utf8');
        var socket = new SmartSocket(ipAddress, port, caText);
        var returnPromise: Promise<SmartSocket> = new Promise((resolve, reject) => {
            socket.setupSocket(dataHandler)
                .then(() => {
                    resolve(socket);
                })
                .catch(reason => {
                    reject(reason);
                })
        });
        return returnPromise;
    }
}