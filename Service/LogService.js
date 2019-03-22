class LogService {

    constructor(debugLog, normalLog, errorLog) {
        if (normalLog) {
            this.normalLog = normalLog;
        } else {
            this.normalLog = console.log;
        }
        if (debugLog) {
            this.debugLog = debugLog;
        } else {
            this.debugLog = () => {
            };
        }
        if (errorLog) {
            this.errorLog = errorLog;
        } else {
            this.errorLog = console.error;
        }
    }

    log(message) {
        this.normalLog(message);
    }

    debug(debugMessage) {
        this.debugLog(debugMessage);
    }

    error(errorMessage) {
        this.errorLog(errorMessage);
    }


}

module.exports = LogService;