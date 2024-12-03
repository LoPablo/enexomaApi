//LogService.js
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

class LogService {

    constructor(inDebugConfig) {
        this.config = inDebugConfig;
        this.debugLog = console.debug;
        this.errorLog = console.error;
    }

    debug(debugMessage, classname) {
        if (true) { //quick bug fix??
            var currentTime = new Date();
            if (typeof debugMessage !== 'undefined' && debugMessage) {
                if (typeof classname !== 'undefined' && classname) {
                    this.debugLog(currentTime.toISOString() + " [" + classname.constructor.name + "] " + debugMessage);
                } else {
                    this.debugLog(debugMessage);
                }
            }
        }
    }

    error(errorMessage, classname) {
        var currentTime = new Date();
        if (typeof errorMessage !== 'undefined' && errorMessage) {
            if (typeof classname !== 'undefined' && classname) {
                this.errorLog(currentTime.toISOString() + " [" + classname.constructor.name + "] " + errorMessage);
            } else {
                this.errorLog(errorMessage);
            }
        }
    }


}

module.exports = LogService;
