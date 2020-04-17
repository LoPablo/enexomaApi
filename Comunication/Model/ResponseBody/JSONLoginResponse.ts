//JSONHeloResponse.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for Response answers
//--------------------------------------------------

import JSONHelper from "../JSONHelper";


export default class JSONLoginResponse {

    hardware?: string;
    macAddress?: string;
    pushNotificationUrl?: string;
    sessionID?: string;
    shsVersion?: string;

    constructor(hardware?: string, macAddress?: string, pushNotificationUrl?: string, sessionID?: string, shsVersion?: string) {
        this.hardware = hardware;
        this.macAddress = macAddress;
        this.pushNotificationUrl = pushNotificationUrl;
        this.sessionID = sessionID;
        this.shsVersion = shsVersion;

    }

    static fromObject(object: any): JSONLoginResponse {
        return new JSONLoginResponse(
            object.hardware,
            object.macAddress,
            object.pushNotificationUrl,
            object.sessionID,
            object.shsVersion
        )
    }

}