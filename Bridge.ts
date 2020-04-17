//Bridge.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Handles incoming messages from a SmartSocket and
//emits Events defined in Helpers/Events
//--------------------------------------------------

import DataDelegateInterface from "./Comunication/DataDelegateInterface";
import Deferred from "./Helpers/Deffered";
import JSONResponse from "./Comunication/Model/JSONResponse";
import {factory} from "./Helpers/Logger";
import JSONLoginResponse from "./Comunication/Model/ResponseBody/JSONLoginResponse";
import JSONNewDeviceValueResponse from "./Comunication/Model/ResponseBody/JSONNewDeviceValueResponse";

const log = factory.getLogger("Main.Bridge");

export default class Bridge implements DataDelegateInterface {

    private promiseQueue: Array<Deferred<JSONResponse>>;
    private sessionID?: string;
    private lastTimestamp: Date;

    constructor() {
        log.info("Bridge says Hello");
        this.promiseQueue = [];
        this.lastTimestamp = new Date(0);
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

    handleLoginMessage(response: JSONLoginResponse) {
        if (response.sessionID) {
            this.sessionID = response.sessionID;
        }
        //FIXME CREATE DEVICE WITH PARAMETERS
    }

    handleNewDeviceValue(response: JSONNewDeviceValueResponse) {

    }

    private handleUpdate(response: JSONResponse) {
        if (response.responseMessage) {
            switch (response.responseMessage) {
                case "newDeviceValue":
                    let responseNewDeviceValue =
                        this.handleNewDeviceValue(JSONNewDeviceValueResponse.fromObject(response.response))
                    break;

                case "newDeviceInfo":

                    break;
                default:

                    break;
            }
        }
    }
}

//
//     getTranslatedString(inString) {
//         let localString = inString;
//         if (inString && typeof inString == 'string') {
//             const instance = this;
//             const regex = /\${(.*?)\}/gm;
//             let newLocations = inString.match(regex);
//             if (newLocations) {
//                 newLocations.forEach((value) => {
//                     if (this.dataStorage.translationMap.has(value.substring(2, value.length - 1))) {
//                         const newValue = instance.getTranslatedString(this.dataStorage.translationMap.get(value.substring(2, value.length - 1)));
//                         localString = localString.replace(value, newValue);
//                     }
//                 });
//             }
//         }
//         return localString;
//     }
//
//     updateDeviceValue(data) {
//         if (data) {
//             if (data.deviceID && (data.value || data.value === "" || data.value === 0)) {
//                 this.dataStorage.deviceValueMap.set(data.deviceID, data);
//                 //Translating keys of an object
//                 Object.keys(data).forEach((key) => {
//                     data[key] = this.getTranslatedString(data[key]);
//                 });
//                 this.emit(Events.newDeviceValue, data);
//             } else {
//                 this.emit(Events.internalError, 'Did not inform update device value because of missing values');
//             }
//         } else {
//             this.emit(Events.internalError, 'Did not inform update device value because of missing input');
//         }
//     }
//
//     newDeviceValue(data) {
//         this.updateTimestamp(data);
//         if (data && data.response) {
//             this.updateDeviceValue(data.response);
//         }
//     }
//
//     updateDeviceInfo(data) {
//         if (data) {
//             if (data.deviceID && data.deviceName && data.deviceDesignation) {
//                 this.dataStorage.deviceMap.set(data.deviceID, data);
//                 //Translating keys of an object
//                 Object.keys(data).forEach((key) => {
//                     data[key] = this.getTranslatedString(data[key]);
//                 });
//                 this.emit(Events.newDeviceInfo, data)
//             } else {
//                 this.emit(Events.internalError, 'Did not inform update device info because of missing values');
//             }
//         } else {
//             this.emit(Events.internalError, 'Did not inform update device info because of missing input');
//         }
//     }
//
//     newDeviceInfo(data) {
//         this.updateTimestamp(data);
//         if (data && data.response) {
//             this.updateDeviceInfo(data.response);
//         }
//     }
//
//     updateLanguageTranslation(data) {
//         if (data.languageTranslationVersion && data.languageTranslationVersion > this.dataStorage.lastLanguageTranslationVersion && data.newTranslatedStrings) {
//             this.version = data.languageTranslationVersion;
//             data.newTranslatedStrings.forEach((key) => {
//                 if (key.key && key.value) {
//                     this.dataStorage.translationMap.set(key.key, key.value);
//                 }
//             });
//         }
//     }
//
//     updateCompatibilityConfiguration(data) {
//         //TODO: Implement
//         //There are serveral cases that are to be considerd
//         //Also in the compatibility Config there are definied Commands. Maybe these can be used for more stuff
//         //and be checked against when sending a run command
//     }
//
//     refreshDataNormal() {
//         return this.refreshData(this.dataStorage.lastTimestamp, this.dataStorage.lastCompatibilityConfigVersion, this.dataStorage.lastLanguageTranslationVersion);
//     }
//
//     refreshDevices() {
//         return this.refreshData(0, this.dataStorage.lastCompatibilityConfigVersion, this.dataStorage.lastLanguageTranslationVersion);
//     }
//
//     refreshDataForce() {
//         return this.refreshData(0, 0, 0);
//     }
//
//     refreshData(timestamp, compatibilityConfigVersion, languageTranslationVersion) {
//         const instance = this;
//         return new Promise((resolve, reject) => {
//             instance.smartSocket.sendAndRecieveCommand(CommandFactory.createAllNewInfoCmd(timestamp, compatibilityConfigVersion, languageTranslationVersion), instance.sessionService.sessionID)
//                 .catch((error) => {
//                     reject(error);
//                 })
//                 .then((data) => {
//                     if (data && data.currentTimestamp) {
//                         instance.dataStorage.lastTimestamp = data.currentTimestamp;
//                         if (data.newCompatibilityConfiguration) {
//                             //TODO:implement
//                         }
//                         if (data.newLanguageTranslation) {
//                             this.updateLanguageTranslation(data.newLanguageTranslation);
//                         }
//                         if (data.newDeviceInfos) {
//                             data.newDeviceInfos.forEach((key) => {
//                                 instance.updateDeviceInfo(key);
//                             });
//                         }
//                         if (data.newDeviceValues) {
//                             data.newDeviceValues.forEach((key) => {
//                                 instance.updateDeviceValue(key);
//                             });
//                         }
//                     }
//                     resolve();
//                 });
//         });
//     }
//
//     setDeviceValue(inDeviceId, inValue) {
//
//         return new Promise((resolve, reject) => {
//             this.smartSocket.sendAndRecieveCommand(CommandFactory.createSetDeviceValueCmd(inDeviceId, inValue), this.sessionService.sessionID)
//                 .then((data) => {
//                     resolve();
//                 })
//                 .catch((err) => {
//                     reject(err);
//                 });
//         });
//     }
//
//
// }
//
// module.exports = Bridge;