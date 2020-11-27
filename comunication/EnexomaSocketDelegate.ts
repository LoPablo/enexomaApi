//EnexomaSocketDelegate.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

import Deffered from "../helpers/Deffered";
import JSONResponse from "./comModel/JSONResponse";
import LoginResponse from "./comModel/responseBody/LoginResponse";
import DeviceValue from "./comModel/responseBody/DeviceValue";
import JSONCommand from "./comModel/JSONCommand";
import LanguageTranslation from "./comModel/responseBody/LanguageTranslation";

export default interface EnexomaSocketDelegate {
    queueUpPromise(promise: Deffered<JSONResponse>);

    handleDisconnect();

    handleMessage(data: string);

    handleLoginMessage(response: LoginResponse);

    handleNewDeviceValue(response: DeviceValue);

    handleNewLanguageTranslation(response: LanguageTranslation);

    resolveNextPromise(response: JSONResponse);

    rejectNextPromise(reason: any);

    sendCommand(command: JSONCommand);
}