const CommandFactory = require('../Comunication/CommandFactory');
const DeviceService = require('./DeviceService');
const TranslationService = require('./TranslationService');
const CompatibilityConfigService = require('./CompatibilityConfigService');
const EventEmitter = require('events');
const Events = require('../Helpers/Events');


class dataService extends EventEmitter {

    constructor(inSmartSocket, inSessionService, inDataStorage) {
        super();
        this.smartSocket = inSmartSocket;
        this.sessionSocket = inSessionService;
        this.dataStorage = inDataStorage;
        this.deviceService = new DeviceService(inSmartSocket, inSessionService, this.dataStorage.deviceMap, this.dataStorage.deviceValueMap);
        this.translationService = new TranslationService(this.dataStorage.translationMap);
        this.compatibilityConfigService = new CompatibilityConfigService(this.dataStorage.compatibilityConfigurationMap);
    }

    updateLanguageTranslation(newVersion) {
        if (newVersion && newVersion.response && newVersion.currentTimestamp) {
            this.dataStorage.lastTimestamp = newVersion.currentTimestamp;
            let changeID = this.translationService.newVersion(newVersion.response);
            this.emit(Events.newDeviceInfo, changeID);
        }
    }

    updateCompatibilityConfiguration(newVersion) {
        //TODO: implement
    }

    updateDeviceValue(newValues) {
        if (newValues && newValues.response && newValues.currentTimestamp) {
            this.dataStorage.lastTimestamp = newValues.currentTimestamp;
            let changeID = this.deviceService.updateDeviceValue(newValues.response);
            this.emit(Events.newDeviceValue, changeID);
        }
    }

    updateTimestampOnly(newTimestampMessage) {
        if (newTimestampMessage && newTimestampMessage.currentTimestamp) {
            this.dataStorage.lastTimestamp = newTimestampMessage.currentTimestamp;
        }
    }

    updateDeviceInfo(newDevice) {
        if (newDevice && newDevice.response && newDevice.currentTimestamp) {
            this.dataStorage.lastTimestamp = newDevice.currentTimestamp;
            let newID = this.deviceService.newDevice(newDevice.response);
            this.emit(Events.newDeviceInfo, newID);
        }
    }

    getDevice(inDeviceID) {
        return this.deviceService.getDevice(inDeviceID);
    }

    getDeviceValue(inDeviceID) {
        return this.deviceService.getDeviceValue(inDeviceID)
    }

    getTranslatedDevice(inDeviceID) {
        var localdevice = KSON.parse(JSON.stringify(his.deviceService.getDevice(inDeviceID))); //maybe no copy is needed maybe only edit object when edited
        return this.translationService.translateAllObjectKeys(localdevice);
    }

    refreshDataForce() {
        return this.refreshData(0, 0, 0);
    }

    refreshData(timestamp, compatibilityConfigVersion, languageTranslationVersion) {
        const instance = this;
        return new Promise((resolve, reject) => {
            instance.smartSocket.sendAndRecieveCommand(CommandFactory.createAllNewInfoCmd(timestamp, compatibilityConfigVersion, languageTranslationVersion), instance.sessionSocket.sessionID)
                .catch((error) => {
                    reject(error);
                })
                .then((data) => {
                    if (data && data.currentTimestamp) {
                        instance.dataStorage.lastTimestamp = data.currentTimestamp;
                        if (data.newCompatibilityConfiguration) {
                            instance.dataStorage.lastCompatibilityConfigVersion = instance.compatibilityConfigService.newVersion(data.newCompatibilityConfiguration)
                        }
                        if (data.newLanguageTranslation) {
                            instance.dataStorage.lastLanguageTranslationVersion = instance.translationService.newVersion(data.newLanguageTranslation);
                        }
                        if (data.newDeviceInfos) {
                            instance.deviceService.newDevices(data.newDeviceInfos);
                        }
                        if (data.newDeviceValues) {
                            instance.deviceService.updateDeviceValues(data.newDeviceValues);
                        }
                    }
                    resolve();
                });
        });
    }

    refreshDataNormal() {
        return this.refreshData(this.dataStorage.lastTimestamp, this.dataStorage.lastCompatibilityConfigVersion, this.dataStorage.lastLanguageTranslationVersion);
    }

    setDeviceValue(inDeviceId, inValue) {
        return this.deviceService.setDeviceValue(inDeviceId, inValue);
    }

    executeDeviceCommand(inDeviceId, inCommand) {
        return this.deviceService.executeDeviceCommand(inDeviceId, inCommand);
    }
}

module.exports = dataService;