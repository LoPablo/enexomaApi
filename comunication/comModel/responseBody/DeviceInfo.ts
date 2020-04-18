import JSONHelper from "../JSONHelper";

export default class DeviceInfo {

    deviceID?: number;
    deviceName?: string;
    masterDeviceID?: number;
    masterDeviceName?: string;
    manufacture?: string;

    deviceDesignation?: string;
    deviceTypClient?: string;
    firstLevel?: Boolean;

    constructor(deviceID?: number, deviceName?: string, masterDeviceID?: number, masterDeviceName?: string, manufacture?: string, deviceDesignation?: string, deviceTypClient?: string, firstLevel?: Boolean) {
        this.deviceID = deviceID;
        this.deviceName = deviceName;
        this.masterDeviceID = masterDeviceID;
        this.masterDeviceName = masterDeviceName;
        this.manufacture = manufacture;
        this.deviceDesignation = deviceDesignation;
        this.deviceTypClient = deviceTypClient;
        this.firstLevel = firstLevel;
    }

    static fromObject(object: any): DeviceInfo {
        return new DeviceInfo(
            object.deviceID,
            object.deviceName,
            object.masterDeviceID,
            object.masterDeviceName,
            object.manufacture,
            object.deviceDesignation,
            object.deviceTypClient,
            object.firstLevel
        );
    }

}