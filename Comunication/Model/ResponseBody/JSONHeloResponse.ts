//JSONHeloResponse.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for Response answers
//--------------------------------------------------

import JSONHelper from "../JSONHelper";


export default class JSONHeloResponse {

    salt?: string;
    sessionSalt?: string;

    constructor(salt?: string, sessionSalt?: string) {
        this.salt = salt;
        this.sessionSalt = sessionSalt;
    }

    static fromObject(object: any): JSONHeloResponse {
        return new JSONHeloResponse(
            object.salt,
            object.sessionSalt
        )
    }

}