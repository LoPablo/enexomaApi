//SchellenbergBridge.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Handles incoming messages from a SmartSocket and
//emits Events defined in helpers/Events
//This is an exmaple Class that implements the DataDelegateInterface which is required by the Socket
//Implement an App in this Fashion
//--------------------------------------------------

import DataDelegateInterface from "./comunication/DataDelegateInterface";
import Deferred from "./helpers/Deffered";
import JSONResponse from "./comunication/comModel/JSONResponse";
import {factory} from "./helpers/Logger";
import LoginResponse from "./comunication/comModel/responseBody/LoginResponse";
import DeviceValue from "./comunication/comModel/responseBody/DeviceValue";
import SmartSocket from "./comunication/SmartSocket";
import SmartSocketFactory from "./comunication/SmartSocketFactory";
import CommandFactory from "./comunication/CommandFactory";
import AllNewDeviceInfos from "./comunication/comModel/responseBody/AllNewDeviceInfos";
import JSONCommand from "./comunication/comModel/JSONCommand";

const log = factory.getLogger("Main.SchellenbergBridge");

export default class SchellenbergBridge implements DataDelegateInterface {

    private promiseQueue: Array<Deferred<JSONResponse>>;
    private loginResponse?: LoginResponse;
    private lastTimestamp: Date;
    private socket?: SmartSocket;
    private compatibilityConfigurationVersion: string;
    private languageTranslationVersion: string;

    constructor() {
        log.info("SchellenbergBridge says Hello");
        this.promiseQueue = [];
        this.lastTimestamp = new Date(0);
        this.compatibilityConfigurationVersion = "0";
        this.languageTranslationVersion = "0";
        SmartSocketFactory.createSocketAndLogin('10.10.20.12', 4300, './comunication/CA.pem', 'Admin', 'PASSWORDGOESHERE', 'D19015i', '2.13', '2.13', this, true)
            .then(returnedSocket => {
                this.socket = returnedSocket;
                if (this.socket && this.loginResponse) {
                    let command = CommandFactory.createAllNewInfoCmd(this.lastTimestamp, this.compatibilityConfigurationVersion, this.languageTranslationVersion);
                    return this.socket.sendAndRecieveCommand(command, this.loginResponse.sessionID)
                }
            })
            .then(response => {
                if (response && response.response) {
                    let parsedResponse: AllNewDeviceInfos = AllNewDeviceInfos.fromObject(response.response);
                    console.log(parsedResponse.newDeviceInfos!)
                    console.log(parsedResponse.newCompatibilityConfiguration!)
                }

            });
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
            log.error("Missing parameters in Login Message. Cannot continue, exiting.")
            this.requestExit();
        }
    }

    public handleNewDeviceValue(response: DeviceValue) {

    }

    sendCommand(command: JSONCommand) {
        if (this.socket && this.loginResponse && this.loginResponse.sessionID) {
            this.socket.sendJSONCommand(command, this.loginResponse.sessionID)
        }
    }

    private handleUpdate(response: JSONResponse) {
        if (response.responseMessage) {
            switch (response.responseMessage) {
                case "newDeviceValue":
                    let responseNewDeviceValue =
                        this.handleNewDeviceValue(DeviceValue.fromObject(response.response))
                    break;

                case "newDeviceInfo":

                    break;
                default:

                    break;
            }
        }
    }

    private requestExit() {

    }


}