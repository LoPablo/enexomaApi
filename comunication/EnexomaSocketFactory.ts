//EnexomaSocketFactory.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

import EnexomaSocket from "./EnexomaSocket";
import fs from "fs";
import EnexomaSocketDelegate from "./EnexomaSocketDelegate";
import CommandFactory from "./CommandFactory";
import HashHelper from "./HashHelper";
import HeloResponse from "./comModel/responseBody/HeloResponse";
import LoginResponse from "./comModel/responseBody/LoginResponse";

export default class EnexomaSocketFactory {

    static createSocketAndLogin(ipAddress: string, port: number, caPath: string, username: string, password: string, cSymbol: string, shcVersion: string, shApiVersion: string, dataHandler?: EnexomaSocketDelegate, startKeepAlive?: Boolean): Promise<EnexomaSocket> {
        const returnPromise: Promise<EnexomaSocket> = new Promise((resolve, reject) => {
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

    static createSocket(ipAddress: string, port: number, caPath: string, dataHandler?: EnexomaSocketDelegate): Promise<EnexomaSocket> {
        const caText: string = fs.readFileSync(caPath, 'utf8');
        const socket = new EnexomaSocket(ipAddress, port, caText);
        const returnPromise: Promise<EnexomaSocket> = new Promise((resolve, reject) => {
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