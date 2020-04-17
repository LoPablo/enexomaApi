import Deffered from "../Helpers/Deffered";
import JSONResponse from "./Model/JSONResponse";
import JSONLoginResponse from "./Model/ResponseBody/JSONLoginResponse";
import JSONNewDeviceValueResponse from "./Model/ResponseBody/JSONNewDeviceValueResponse";

export default interface DataDelegateInterface {
    queueUpPromise(promise: Deffered<JSONResponse>);

    handleDisconnect();

    handleMessage(data: string);

    handleLoginMessage(response: JSONLoginResponse);

    handleNewDeviceValue(response: JSONNewDeviceValueResponse);

    resolveNextPromise(response: JSONResponse);

    rejectNextPromise(reason: any);
}