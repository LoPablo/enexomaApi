//JSONNewDeviceValueResponse.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for Response answers
//--------------------------------------------------

import JSONHelper from "../JSONHelper";

export default class NewDeviceValue {

    deviceID?: string;
    masterDeviceID?: string;
    value?: string;
    valueTimestamp?: Date;

    constructor(deviceID?: string, masterDeviceID?: string, value?: string, valueTimestamp?: Date) {
        this.deviceID = deviceID;
        this.masterDeviceID = masterDeviceID;
        this.value = value;
        this.valueTimestamp = valueTimestamp;
    }

    static fromObject(object: any): NewDeviceValue {
        return new NewDeviceValue(
            object.deviceID,
            object.masterDeviceID,
            object.value,
            JSONHelper.stringToDate(object.valueTimestamp)
        );
    }

}