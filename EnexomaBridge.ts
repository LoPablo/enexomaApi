//EnexomaBridge.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Handles incoming messages from a EnexomaSocket and
//This is an example Class that implements the EnexomaSocketDelegate which is required by the Socket
//Implement an App in this fashion
//--------------------------------------------------

import EnexomaSocketDelegate from "./comunication/EnexomaSocketDelegate";
import Deferred from "./helpers/Deffered";
import JSONResponse from "./comunication/comModel/JSONResponse";
import {factory} from "./helpers/Logger";
import LoginResponse from "./comunication/comModel/responseBody/LoginResponse";
import DeviceValue from "./comunication/comModel/responseBody/DeviceValue";
import EnexomaSocket from "./comunication/EnexomaSocket";
import EnexomaSocketFactory from "./comunication/EnexomaSocketFactory";
import CommandFactory from "./comunication/CommandFactory";
import AllNewDeviceInfos from "./comunication/comModel/responseBody/AllNewDeviceInfos";
import JSONCommand from "./comunication/comModel/JSONCommand";
import LanguageTranslation from "./comunication/comModel/responseBody/LanguageTranslation";
import EnexomaBridgeDelegate from "./EnexomaBridgeDelegate";
import LoginConfig from "./comunication/comModel/LoginConfig";
import DeviceInfo from "./comunication/comModel/responseBody/DeviceInfo";

const log = factory.getLogger("Main.EnexomaBridge");

export default class EnexomaBridge implements EnexomaSocketDelegate {

    private promiseQueue: Array<Deferred<JSONResponse>>;
    private loginResponse?: LoginResponse;
    private socket?: EnexomaSocket;
    private readonly externalBridgeDelegate: EnexomaBridgeDelegate[];

    private lastTimestamp: Date;
    private compatibilityConfigurationVersion: string;
    private languageTranslationVersion: string;
    private loginConfigData: LoginConfig;

    constructor(loginConfigData: LoginConfig) {
        log.info("EnexomaBridge says Hello");
        this.promiseQueue = [];
        this.externalBridgeDelegate = [];

        this.lastTimestamp = new Date(0);
        this.compatibilityConfigurationVersion = "0";
        this.languageTranslationVersion = "0";
        this.loginConfigData = loginConfigData;

        this.bootstrap();
    }

    private bootstrap(){
        EnexomaSocketFactory.createSocketAndLogin(this.loginConfigData.ipAddress, this.loginConfigData.port, this.loginConfigData.caPath, this.loginConfigData.username, this.loginConfigData.password, this.loginConfigData.cSymbol, this.loginConfigData.shcVersion, this.loginConfigData.shApiVersion, this, true)
            .then(returnedSocket => {
                this.socket = returnedSocket;
                if (this.socket && this.loginResponse) {
                    let command = CommandFactory.createAllNewInfoCmd(this.lastTimestamp, this.compatibilityConfigurationVersion, this.languageTranslationVersion);
                    return this.socket.sendAndRecieveCommand(command, this.loginResponse.sessionID);
                }
            })
            .then(response => {
                if (response && response.response) {
                    let parsedResponse: AllNewDeviceInfos = AllNewDeviceInfos.fromObject(response.response);
                    if (parsedResponse.newDeviceInfos) {
                        if (parsedResponse.newDeviceInfos.values) {
                            for (let deviceInfo of parsedResponse.newDeviceInfos.values) {
                                this.handleNewDeviceInfo(deviceInfo);
                            }
                        }
                    }
                    if (parsedResponse.newDeviceValues) {
                        if (parsedResponse.newDeviceValues.values) {
                            for (let deviceValue of parsedResponse.newDeviceValues.values) {
                                this.handleNewDeviceValue(deviceValue);
                            }
                        }
                    }
                    if (parsedResponse.newCompatibilityConfiguration) {
                        if (parsedResponse.newCompatibilityConfiguration.compatibilityConfigurationVersion) {
                            this.compatibilityConfigurationVersion = parsedResponse.newCompatibilityConfiguration.compatibilityConfigurationVersion.toString();
                        }
                    }
                    if (parsedResponse.newLanguageTranslations) {
                        if (parsedResponse.newLanguageTranslations.languageTranslationVersion) {
                            this.languageTranslationVersion = parsedResponse.newLanguageTranslations.languageTranslationVersion.toString();
                        }
                    }
                }

            });
    }

    public registerDelegate(enexomaBridgeDelegate: EnexomaBridgeDelegate) {
        this.externalBridgeDelegate.push(enexomaBridgeDelegate);
    }

    public handleDisconnect() {
        log.debug("Handle Disconnect was called. Rejecting all queued Promises");
        this.promiseQueue.forEach((entry) => {
            entry.reject("Socket Disconnected");
        });
    }

    public handleMessage(data: string) {
        if (data) {
            let parsedResponse: JSONResponse = JSONResponse.fromJSONString(data);
            if (parsedResponse.currentTimestamp) {
                log.debug("Updated Timestamp to " + parsedResponse.currentTimestamp);
                this.lastTimestamp = parsedResponse.currentTimestamp;
            }
            switch (parsedResponse.responseCode) {
                case -1:
                    this.rejectNextPromise(parsedResponse);
                    break;
                case 1:
                    this.resolveNextPromise(parsedResponse);
                    break;
                case 2:
                    this.handleUpdate(parsedResponse);
                    break;
                case 5:
                    //Message Boxes and Disconnect because of login. So FIXME
                    break;
                default:

                    break;
            }
        }

    }

    public queueUpPromise(promise: Deferred<JSONResponse>) {
        this.promiseQueue.push(promise);
    }

    public rejectNextPromise(reason: any) {
        if (this.promiseQueue.length > 0) {
            let promise = this.promiseQueue.shift();
            if (promise) {
                promise.reject(reason);
            }
        }
    }

    public resolveNextPromise(response: JSONResponse) {
        if (this.promiseQueue.length > 0) {
            let promise = this.promiseQueue.shift();
            if (promise) {
                promise.resolve(response);
            }
        }
    }

    public handleLoginMessage(response: LoginResponse) {
        if (response.sessionID && response.hardware && response.macAddress && response.shsVersion) {
            this.loginResponse = response;
        } else {
            log.error("Missing parameters in Login Message. Cannot continue, exiting.");
        }
    }

    public handleNewDeviceValue(response: DeviceValue) {
        for (let delegate of this.externalBridgeDelegate) {
            if (delegate) {
                delegate.newDeviceValue(response);
            }
        }
    }

    public handleNewLanguageTranslation(response: LanguageTranslation) {

    }

    public sendCommand(command: JSONCommand) {
        if (this.socket && this.loginResponse && this.loginResponse.sessionID) {
            this.socket.sendJSONCommand(command, this.loginResponse.sessionID);
        }
    }

    private handleUpdate(response: JSONResponse) {
        if (response.responseMessage) {
            switch (response.responseMessage) {
                case "newDeviceValue":
                    this.handleNewDeviceValue(DeviceValue.fromObject(response.response));
                    break;

                case "newDeviceInfo":
                    this.handleNewDeviceInfo(DeviceInfo.fromObject(response.response));
                    break;
                default:

                    break;
            }
        }
    }

    private handleNewDeviceInfo(response: DeviceInfo) {
        for (let delegate of this.externalBridgeDelegate) {
            if (delegate) {
                delegate.newDeviceInfo(response);
            }
        }
    }

    private renewSocket(reason: string) {
        log.info("Socket renewal was requested with reason: " + reason);
        setTimeout(() => {
            this.bootstrap();
        }, 1000);
    }

}