const CommandFactory = require('../Comunication/CommandFactory');

class DeviceService {

    constructor(inSmartSocket, inSessionService, inDeviceMap, inDeviceValueMap) {
        this.smartSocket = inSmartSocket;
        this.sessionService = inSessionService;
        this.deviceMap = inDeviceMap;
        this.deviceValueMap = inDeviceValueMap;
    }

    newDevices(inNewDeviceInfos) {
        for (let i = 0; i < inNewDeviceInfos.length; i++) {
            this.newDevice(inNewDeviceInfos[i]);
        }
    }

    newDevice(inNewDeviceInfo) {
        let retID = null;
        if (inNewDeviceInfo) {
            if (inNewDeviceInfo.deviceID && inNewDeviceInfo.deviceName && inNewDeviceInfo.deviceName && inNewDeviceInfo.deviceDesignation && inNewDeviceInfo.manufacturer) {
                let oldValue = this.getDeviceValue(inNewDeviceInfo.deviceID);
                this.deviceMap.set(inNewDeviceInfo.deviceID, inNewDeviceInfo);
                retID = inNewDeviceInfo.deviceID;
            }
        }
        return retID;
    }

    getDevice(inDeviceId) {
        let retDevice = null;
        if (this.deviceMap.has(inDeviceId)) {
            retDevice = this.deviceMap.get(inDeviceId);
        }
        return retDevice;
    }

    getDeviceValue(inDeviceId) {
        let retValue = null;
        if (this.deviceMap.has(inDeviceId) && this.deviceValueMap.has(inDeviceId)) {
            retValue = this.deviceValueMap.get(inDeviceId);
        }
        return retValue;
    }

    getAllDevices() {
        return this.deviceMap;
    }

    setDeviceValue(inDeviceId, inValue) {
        const instance = this;
        return new Promise((resolve, reject) => {
            if (instance.deviceMap.has(inDeviceId)) {
                instance.smartSocket.sendAndRecieveCommand(CommandFactory.createSetDeviceValueCmd(inDeviceId, inValue), instance.sessionService.sessionID)
                    .catch((error) => {
                        reject(error);
                    })
                    .then(() => {
                        instance.updateDeviceValue(inDeviceId, inValue);
                        resolve();
                    });
            } else {
                reject('unknown device');
            }

        });
    }

    executeDeviceCommand(inDeviceId, inValue) {
        //DONT KNOW WHAT IT IS SUPOSSD TO TO BUT NEED IMPLEMENTATION
    }

    updateDeviceValues(inNewDeviceValues) {
        for (let i = 0; i < inNewDeviceValues.length; i++) {
            this.updateDeviceValue(inNewDeviceValues[i]);
        }
    }

    updateDeviceValue(inNewValue) {
        let retId = null;
        if (inNewValue.deviceID && (inNewValue.value || inNewValue.value === 0)) {
            this.deviceValueMap.set(inNewValue.deviceID, inNewValue.value);
            retId = inNewValue.deviceID;
        }
        return retId;
    }

    addDevice(inDeviceConfig) {

    }

    deletedDevice() {

    }

}

module.exports = DeviceService;