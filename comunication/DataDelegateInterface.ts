import Deffered from "../helpers/Deffered";
import JSONResponse from "./comModel/JSONResponse";
import LoginResponse from "./comModel/responseBody/LoginResponse";
import DeviceValue from "./comModel/responseBody/DeviceValue";
import SmartSocket from "./SmartSocket";

export default interface DataDelegateInterface {
    queueUpPromise(promise: Deffered<JSONResponse>);

    handleDisconnect();

    handleMessage(data: string);

    handleLoginMessage(response: LoginResponse);

    handleNewDeviceValue(response: DeviceValue);

    resolveNextPromise(response: JSONResponse);

    rejectNextPromise(reason: any);
}