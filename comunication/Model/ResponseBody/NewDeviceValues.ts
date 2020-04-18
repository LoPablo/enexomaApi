import NewDeviceValue from "./NewDeviceValue";

export default class NewDeviceValues {

    values?: NewDeviceValue[]

    constructor(values?: NewDeviceValue[]) {
        this.values = values;
    }

    static fromObject(object: any): NewDeviceValues {
        let tempValues: NewDeviceValue[] = [];
        for (let valueEntry of object) {
            tempValues.push(NewDeviceValue.fromObject(valueEntry));
        }
        return new NewDeviceValues(
            tempValues
        );
    }

}