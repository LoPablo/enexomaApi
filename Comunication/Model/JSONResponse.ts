//JSONResponse.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for Response answers
//--------------------------------------------------

import JSONHelper from "./JSONHelper";

export default class JSONResponse {

    currentTimestamp?: Date;
    response?: any;
    responseCode?: number;
    responseMessage?: string;

    constructor(currentTimestamp?: Date, response?: string, responseCode?: number, responseMessage?: string) {
        this.currentTimestamp = currentTimestamp;
        this.response = response;
        this.responseCode = responseCode;
        this.responseMessage = responseMessage;
    }

    static fromJSONString(json: string): JSONResponse {
        let jsonObject = JSON.parse(json);
        return this.fromObject(jsonObject);
    }

    static fromObject(object: any): JSONResponse {
        return new JSONResponse(
            JSONHelper.stringToDate(object.currentTimestamp),
            object.response,
            object.responseCode,
            object.responseMessage
        )
    }

}