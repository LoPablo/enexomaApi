const Command = require('./Command');

class CommandFactory {

    static createLoginCmd(inUsername, inDigest, inCSymbol, inShcVersion, inShApiVersion) {
        return new loginCmd(inUsername, inDigest, inCSymbol, inShcVersion, inShApiVersion);
    }

    static createAllNewInfoCmd(inTimestamp, inCCVersion, inLTVersion) {
        return new allNewInfoCmd(inTimestamp, inCCVersion, inLTVersion);
    }

    static createSetDeviceValueCmd(inDeviceId, inValue) {
        return new setDeviceValueCmd(inDeviceId, inValue);
    }

    static createupdateAllDeviceValues() {
        return new Command('keepalive')
    }

    static createGetComptibilityConfigurationCmd() {
        return new Command('getCompatibilityConfiguration')
    }

    static createLogoutCmd() {
        return new Command('logout');
    }

    static createKeepAliveCmd() {
        return new Command('keepalive')
    }

    static createHeloCmd(inUsername) {
        return new heloCmd(inUsername)
    }

}

module.exports = CommandFactory;

class heloCmd extends Command {
    constructor(inUsername) {
        super('helo');
        this.username = inUsername;
    }
}

class loginCmd extends Command {
    constructor(inUsername, inDigest, inCSymbol, inShcVersion, inShApiVersion) {
        super('login');
        this.username = inUsername;
        this.digest = inDigest;
        this.cSymbol = inCSymbol;
        this.shcVersion = inShcVersion;
        this.shApiVersion = inShApiVersion;
    }
}

class allNewInfoCmd extends Command {
    constructor(inTimestamp, inCCVersion, inLTVersion) {
        super('getAllNewInfos');
        this.timestamp = inTimestamp;
        this.compatibilityConfigurationVersion = inCCVersion;
        this.languageTranslationVersion = inLTVersion;
    }
}

class setDeviceValueCmd extends Command {
    constructor(inDeviceId, inValue) {
        super('setDeviceValue');
        this.deviceID = inDeviceId;
        this.value = inValue;
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