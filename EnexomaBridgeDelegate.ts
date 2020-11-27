import DeviceValue from "./comunication/comModel/responseBody/DeviceValue";
import DeviceInfo from "./comunication/comModel/responseBody/DeviceInfo";

export default interface EnexomaBridgeDelegate {
    newDeviceInfo(deviceInfo : DeviceInfo);
    newDeviceValue(deviceValue : DeviceValue);
    removedDevice(deviceInfo : DeviceInfo);
}