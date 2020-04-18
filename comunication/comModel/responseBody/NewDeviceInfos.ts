import DeviceInfo from "./DeviceInfo";

export default class NewDeviceInfos {

    values?: DeviceInfo[];

    constructor(values?: DeviceInfo[]) {
        this.values = values;
    }

    static fromObject(object: any): NewDeviceInfos {
        let tempValues: DeviceInfo[] = [];
        for (let valueEntry of object) {
            tempValues.push(DeviceInfo.fromObject(valueEntry));
        }
        return new NewDeviceInfos(
            tempValues
        );
    }

}