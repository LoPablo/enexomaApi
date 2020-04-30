//NewDeviceValues.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

import DeviceValue from "./DeviceValue";

export default class NewDeviceValues {

    values?: DeviceValue[];

    constructor(values?: DeviceValue[]) {
        this.values = values;
    }

    static fromObject(object: any): NewDeviceValues {
        let tempValues: DeviceValue[] = [];
        for (let valueEntry of object) {
            tempValues.push(DeviceValue.fromObject(valueEntry));
        }
        return new NewDeviceValues(
            tempValues
        );
    }

}