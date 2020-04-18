import Deffered from "../helpers/Deffered";
import JSONResponse from "./Model/JSONResponse";
import LoginResponse from "./Model/ResponseBody/LoginResponse";
import NewDeviceValue from "./Model/ResponseBody/NewDeviceValue";
import SmartSocket from "./SmartSocket";

export default interface DataDelegateInterface {
    queueUpPromise(promise: Deffered<JSONResponse>);

    handleDisconnect();

    handleMessage(data: string);

    handleLoginMessage(response: LoginResponse);

    handleNewDeviceValue(response: NewDeviceValue);

    resolveNextPromise(response: JSONResponse);

    rejectNextPromise(reason: any);
}