const CommandFactory = require('../Comunication/CommandFactory');
const EventEmitter = require('events');
const Events = require('../Helpers/Events');

class DataHandler extends EventEmitter {

    constructor(inTimeout, inSessionService, inDataStorage, inSmartSocket) {
        super();
        this.sessionService = inSessionService;
        this.dataStorage = inDataStorage;
        this.sessionService = inSessionService;
        this.disconnectHandlerRequested = false;
        this.smartSocket = inSmartSocket;
        if (inTimeout) {
            this.messageTimeout = inTimeout; //for future usage
        } else {
            this.messageTimeout = 4000;
        }
        this.promiseQueue = [];
    }

    queueUpPromise(inDeferredPromise) {
        this.promiseQueue.push(inDeferredPromise);
    }

    resolveNextPromise(value) {
        const localPromise = this.promiseQueue.shift();
        if (localPromise) {
            localPromise.resolve(value);
        }
    }

    rejectNextPromise() {
        const localPromise = this.promiseQueue.shift();
        if (localPromise) {
            localPromise.reject('err');
        }
    }

    handleMainMessage(data) {
        //console.log(data);
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.hasOwnProperty('responseCode')) {
                    if (parsedData.responseCode === -1) {
                        this.errorHandler(parsedData);
                    } else if (parsedData.responseCode === 1 && parsedData.hasOwnProperty('response')) {
                        this.successHandler(parsedData.response);
                    } else if (parsedData.responseCode === 2) {
                        this.updateHandler(parsedData);
                    } else {

                    }
                }
            } catch (e) {
                this.emit(Events.jsonParseError, e);
            }
        }
    }

    errorHandler(data) {
        this.rejectNextPromise();
        this.emit(Events.apiError, data);
    }

    successHandler(data) {
        if (data) {
            this.resolveNextPromise(data);
            this.updateTimestamp(data);
        }
    }

    updateTimestamp(data) {
        if (data && data.currentTimestamp) {
            this.dataStorage.lastTimestamp = data.currentTimestamp;
        }
    }

    updateHandler(data) {
        if (data && data.response && data.responseMessage) {
            if (data.newLanguageTranslation) {
                this.updateLanguageTranslation(data);
            }
            if (data.newCompatibilityConfiguration) {
                //TODO: implement
            }
            if (data.responseMessage === 'newDeviceInfo') {
                this.newDeviceInfo(data)
            }
            if (data.responseMessage === 'newDeviceValue') {
                this.newDeviceValue(data)
            }
        }
    }

    disconnectHandler() {
        if (!this.disconnectHandlerRequested) {
            this.disconnectHandlerRequested = true;
            this.promiseQueue.forEach((entry) => {
                entry.reject();
            });
            this.emit(Events.disconnected);
        }
    }

    getTranslatedString(inString) {
        let localString = inString;
        if (inString && typeof inString == 'string') {
            const instance = this;
            const regex = /\${(.*?)\}/gm;
            let newLocations = inString.match(regex);
            if (newLocations) {
                newLocations.forEach((value) => {
                    if (this.dataStorage.translationMap.has(value.substring(2, value.length - 1))) {
                        const newValue = instance.getTranslatedString(this.dataStorage.translationMap.get(value.substring(2, value.length - 1)));
                        localString = localString.replace(value, newValue);
                    }
                });
            }
        }
        return localString;
    }

    updateDeviceValue(data) {
        if (data) {
            if (data.deviceID && (data.value || data.value === "" || data.value === 0)) {
                this.dataStorage.deviceValueMap.set(data.deviceID, data);
                //Translating keys of an object
                Object.keys(data).forEach((key) => {
                    data[key] = this.getTranslatedString(data[key]);
                });
                this.emit(Events.newDeviceValue, data);
            } else {
                this.emit(Events.internalError, 'Did not inform update device value because of missing values');
            }
        } else {
            this.emit(Events.internalError, 'Did not inform update device value because of missing input');
        }
    }

    newDeviceValue(data) {
        this.updateTimestamp(data);
        if (data && data.response) {
            this.updateDeviceValue(data.response);
        }
    }

    updateDeviceInfo(data) {
        if (data) {
            if (data.deviceID && data.deviceName && data.deviceDesignation) {
                this.dataStorage.deviceMap.set(data.deviceID, data);
                //Translating keys of an object
                Object.keys(data).forEach((key) => {
                    data[key] = this.getTranslatedString(data[key]);
                });
                this.emit(Events.newDeviceInfo, data)
            } else {
                this.emit(Events.internalError, 'Did not inform update device info because of missing values');
            }
        } else {
            this.emit(Events.internalError, 'Did not inform update device info because of missing input');
        }
    }

    newDeviceInfo(data) {
        this.updateTimestamp(data);
        if (data && data.response) {
            this.updateDeviceInfo(data.response);
        }
    }

    updateLanguageTranslation(data) {
        if (data.languageTranslationVersion && data.languageTranslationVersion > this.dataStorage.lastLanguageTranslationVersion && data.newTranslatedStrings) {
            this.version = data.languageTranslationVersion;
            data.newTranslatedStrings.forEach((key) => {
                if (key.key && key.value) {
                    this.dataStorage.translationMap.set(key.key, key.value);
                }
            });
        }
    }

    refreshDataNormal() {
        return this.refreshData(this.dataStorage.lastTimestamp, this.dataStorage.lastCompatibilityConfigVersion, this.dataStorage.lastLanguageTranslationVersion);
    }

    refreshDevices() {
        return this.refreshData(0, this.dataStorage.lastCompatibilityConfigVersion, this.dataStorage.lastLanguageTranslationVersion);
    }

    refreshDataForce() {
        return this.refreshData(0, 0, 0);
    }

    refreshData(timestamp, compatibilityConfigVersion, languageTranslationVersion) {
        const instance = this;
        return new Promise((resolve, reject) => {
            instance.smartSocket.sendAndRecieveCommand(CommandFactory.createAllNewInfoCmd(timestamp, compatibilityConfigVersion, languageTranslationVersion), instance.sessionService.sessionID)
            .catch((error) => {
                reject(error);
            })
            .then((data) => {
                if (data && data.currentTimestamp) {
                    instance.dataStorage.lastTimestamp = data.currentTimestamp;
                    if (data.newCompatibilityConfiguration) {
                        //TODO:implement
                    }
                    if (data.newLanguageTranslation) {
                        this.updateLanguageTranslation(data.newLanguageTranslation);
                    }
                    if (data.newDeviceInfos) {
                        data.newDeviceInfos.forEach((key) => {
                            instance.updateDeviceInfo(key);
                        });
                    }
                    if (data.newDeviceValues) {
                        data.newDeviceValues.forEach((key) => {
                            instance.updateDeviceValue(key);
                        });
                    }
                }
                resolve();
            });
        });
    }

    setDeviceValue(inDeviceId, inValue) {

        return new Promise((resolve, reject) => {
            this.smartSocket.sendAndRecieveCommand(CommandFactory.createSetDeviceValueCmd(inDeviceId, inValue), this.sessionService.sessionID)
            .then((data) => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
        });
    }
    

}

module.exports = DataHandler;