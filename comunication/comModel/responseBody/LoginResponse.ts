//LoginResponse.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

export default class LoginResponse {

    hardware: string;
    macAddress: string;
    pushNotificationUrl: string;
    sessionID: string;
    shsVersion: string;

    constructor(hardware: string, macAddress: string, pushNotificationUrl: string, sessionID: string, shsVersion: string) {
        this.hardware = hardware;
        this.macAddress = macAddress;
        this.pushNotificationUrl = pushNotificationUrl;
        this.sessionID = sessionID;
        this.shsVersion = shsVersion;

    }

    static fromObject(object: any): LoginResponse {
        return new LoginResponse(
            object.hardware,
            object.macAddress,
            object.pushNotificationUrl,
            object.sessionID,
            object.shsVersion
        )
    }

}