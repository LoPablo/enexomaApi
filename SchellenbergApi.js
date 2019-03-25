const EventEmitter = require('events');
const LogService = require('./Service/LogService');
const SmartSocket = require('./Comunication/SmartSocket');
const SessionService = require('./Service/SessionService');
const KeepAliveService = require('./Service/KeepAliveService');
const DataService = require('./Service/DataService');
const DataStore = require('./DataStore/DataStore');
const MessageHandler = require('./Comunication/MessageHandler');

class SchellenbergApi extends EventEmitter {

    constructor(inConfig, debugLog) {
        super();
        this.debugLog = debugLog;
        if (!inConfig) {
            return;
        }
        this.mainConfig = inConfig;
        this.logService = new LogService(this.debugLog);
        this.dataStore = new DataStore();
        this.attemptCount = 1;
        this._setupServices();
        this._setupSocket();
    }

    reinitializePartly() {
        this.logService.debug('ReinitializeParly called. Will Reinitialize in one second');
        const instance = this;
        setTimeout(() => {
            if (this.keepAliveService) {
                this.keepAliveService.stopKeepAlive();
            }
            instance.setupServices();
            instance.setupSocket();
        }, 1000);

    }

    setupServices() {
        this.mainSocket = new SmartSocket(this.mainConfig.smartSocketConfig, this.logService);
        this.sessionService = new SessionService(this.mainSocket, this.mainConfig.sessionConfig);
        this.keepAliveService = new KeepAliveService(this.mainSocket);
        this.dataService = new DataService(this.mainSocket, this.sessionService, this.dataStore, this.logService);
    }

    setupSocket() {
        this.handler = new MessageHandler(4000, this.dataService, this.reinitializePartly, this.logService);
        this.mainSocket.setupSocket(this.handler)
            .then(() => {
                console.log('connected');
                this.sessionService.requestSession()
                    .then(() => {
                        console.log(this.sessionService.sessionID);
                        this.dataService.refreshDataNormal();
                        this.keepAliveService.startKeepAlive();
                    })
                    .catch((error) => {
                        console.log('wau');
                        console.log(error);
                    });
            })
            .catch((error) => {
                const instance = this;
                if (instance.attemptCount < 6) {
                    this.logService.error(error);
                    this.logService.error("There was an Error setting up the socket, trying again in one minute (Attempt " + this.attemptCount + " of 5).");
                    setTimeout(() => {
                        instance.attemptCount += 1;
                        if (instance.attemptCount < 6) {
                            instance.reinitializePartly();
                        }

                    }, 60000);
                } else {
                    this.logService.error("There was an Error setting up the socket, quitting.")
                }

            });


    }

}

module.exports = SchellenbergApi;