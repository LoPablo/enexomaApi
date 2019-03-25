const EventEmitter = require('events');
const Events = require('../Helpers/Events');

class MessageHandler extends EventEmitter {

    constructor(inTimeout, inDataService) {
        super();
        this.dataService = inDataService;
        if (inTimeout) {
            this.messageTimeout = inTimeout; //for future usage
        } else {
            this.messageTimeout = 4000;
        }
        this.promiseQueue = [];
    }

    queueUpPromise(inDeferredPromise) {
        this.promiseQueue.push(inDeferredPromise);
    }

    resolveNextPromise(value) {
        const localPromise = this.promiseQueue.shift();
        if (localPromise) {
            localPromise.resolve(value);
        }
    }

    rejectNextPromise() {
        const localPromise = this.promiseQueue.shift();
        if (localPromise) {
            localPromise.reject('err');
        }
    }

    handleMainMessage(data) {
        //console.log(data);
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.hasOwnProperty('responseCode')) {
                    if (parsedData.responseCode === -1) {
                        this.errorHandler(parsedData);
                    } else if (parsedData.responseCode === 1 && parsedData.hasOwnProperty('response')) {
                        this.successHandler(parsedData.response);
                    } else if (parsedData.responseCode === 2) {
                        this.updateHandler(parsedData);
                    } else {

                    }
                }
            } catch (e) {
                this.emit(Events.jsonParseError, e);
            }
        }
    }

    errorHandler(data) {
        this.rejectNextPromise();
        this.emit(Events.apiError, data);
    }

    successHandler(data) {
        if (data) {
            this.resolveNextPromise(data);
            this.dataService.updateTimestampOnly(data);
        }
    }

    updateHandler(data) {
        if (data && data.response && data.responseMessage) {
            if (data.newLanguageTranslation) {
                this.dataService.updateLanguageTranslation(data);
            }
            if (data.newCompatibilityConfiguration) {
                this.dataService.updateCompatibilityConfiguration(data);
            }
            if (data.responseMessage === 'newDeviceInfo') {
                this.dataService.updateDeviceInfo(data);
            }
            if (data.responseMessage === 'newDeviceValue') {
                this.dataService.updateDeviceValue(data);
            }
        }
    }

    disconnectHandler() {
        this.promiseQueue.forEach((entry) => {
            entry.reject();
        });
        this.emit(Events.disconnected);
    }
}

module.exports = MessageHandler;