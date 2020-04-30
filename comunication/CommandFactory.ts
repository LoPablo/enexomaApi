//CommandFactory.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Uses Command Wrapper to generate JSON-Commands

import JSONCommand from "./comModel/JSONCommand";
import JSONHelper from "./comModel/JSONHelper";

export default class CommandFactory {

    public static createLoginCommand(username: string, digest: string, cSymbol: string, shcVersion: string, shApiVersion: string): loginCommand {
        return new loginCommand(username, digest, cSymbol, shcVersion, shApiVersion);
    }

    public static createAllNewInfoCmd(timestamp: Date, compatibilityConfigurationVersion: string, languageTranslationVersion: string): allNewInfoCommand {
        return new allNewInfoCommand(JSONHelper.dateToString(timestamp), compatibilityConfigurationVersion, languageTranslationVersion);
    }

    public static createSetDeviceValueCmd(inDeviceId, inValue): setDeviceValueCommand {
        return new setDeviceValueCommand(inDeviceId, inValue);
    }

    public static createupdateAllDeviceValues(): JSONCommand {
        return new JSONCommand("keepalive");
    }

    public static createGetComptibilityConfigurationCmd(): JSONCommand {
        return new JSONCommand("getCompatibilityConfiguration");
    }

    public static createLogoutCmd(): JSONCommand {
        return new JSONCommand("logout");
    }

    public static createKeepAliveCmd(): JSONCommand {
        return new JSONCommand("keepalive");
    }

    public static createHeloCmd(username: string): heloCommand {
        return new heloCommand(username);
    }

}

export class heloCommand extends JSONCommand {

    private username: string;

    constructor(username: string) {
        super('helo');
        this.username = username;
    }
}

export class loginCommand extends JSONCommand {

    private username: string;
    private digest: string;
    private cSymbol: string;
    private shcVersion: string;
    private shApiVersion: string;

    constructor(username, digest, cSymbol, shcVersion, shApiVersion) {
        super('login');
        this.username = username;
        this.digest = digest;
        this.cSymbol = cSymbol;
        this.shcVersion = shcVersion;
        this.shApiVersion = shApiVersion;
    }
}

export class allNewInfoCommand extends JSONCommand {

    private timestamp: string;
    private compatibilityConfigurationVersion: string;
    private languageTranslationVersion: string;

    constructor(timestamp, compatibilityConfigurationVersion, languageTranslationVersion) {
        super('getAllNewInfos');
        this.timestamp = timestamp;
        this.compatibilityConfigurationVersion = compatibilityConfigurationVersion;
        this.languageTranslationVersion = languageTranslationVersion;
    }
}

export class setDeviceValueCommand extends JSONCommand {

    private deviceID: string;
    private value: string;

    constructor(deviceID, value) {
        super('setDeviceValue');
        this.deviceID = deviceID;
        this.value = value;
    }
}


//TODO: implementation nedded

//class executeDeviceCmdCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class newDeviceCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class changeDeviceCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class changeRoomCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class deleteRoomCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class newSwitchingSequenceCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class changeSwitchingSequenceCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class deleteSwitchingSequenceCmd extends Command{
//    constructor(){
//        super('')
//    }
//}

//class activateSwitchingSequenceCmd extends Command{
//    constructor(){
//        super('')
//    }
//}