const EventEmitter = require('events');
const LogService = require('./Service/LogService');
const SmartSocket = require('./Comunication/SmartSocket');
const SessionService = require('./Service/SessionService');
const KeepAliveService = require('./Service/KeepAliveService');
const DataStore = require('./DataStore/DataStore');
const MessageHandler = require('./Comunication/DataHandler');
const Events = require('./Helpers/Events');

class SchellenbergApi extends EventEmitter {

    constructor(inConfig, debugLog) {
        super();
        this.debugLog = debugLog;
        if (!inConfig) {
            return;
        }
        this.mainConfig = inConfig;
        this.logService = new LogService(this.debugLog);
        this.attemptCount = 1;
        this.setupServices();
        this.setupSocket();
    }

    reinitializePartly() {
        this.logService.debug('ReinitializePartly called. Will Reinitialize in one second');
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
        const instance = this;
        this.dataStore = new DataStore();
        this.mainSocket = new SmartSocket(this.mainConfig.smartSocketConfig, this.logService);
        this.sessionService = new SessionService(this.mainSocket, this.mainConfig.sessionConfig);
        this.keepAliveService = new KeepAliveService(this.mainSocket);
        this.handler = new MessageHandler(4000, this.sessionService, this.dataStore, this.mainSocket);
        //Wrapping Events from the dataService, so when data Service gets reinitialized, the events dont drop
        //for objects outside wanting to recieve Events
        this.handler.on(Events.disconnected, () => {
            instance.reinitializePartly();
        });
        this.handler.on(Events.apiError, (error) => {
            instance.logService.debugLog(error);
        });
        this.handler.on(Events.jsonParseError, (error) => {
            instance.logService.debugLog(error);
        });
        this.handler.on(Events.internalError, (error) => {
            instance.logService.debugLog(error);
        });
        this.handler.on(Events.newDeviceInfo, (eventIn) => {
            this.emit(Events.newDeviceInfo, eventIn);
        });
        this.handler.on(Events.newDeviceValue, (eventIn) => {
            this.emit(Events.newDeviceValue, eventIn);
        });
    }

    setupSocket() {
        this.mainSocket.setupSocket(this.handler)
            .then(() => {
                console.log('connected');
                this.sessionService.requestSession()
                    .then(() => {
                        console.log(this.sessionService.sessionID);
                        this.handler.refreshDataNormal();
                        this.keepAliveService.startKeepAlive();
                        this.attemptCount = 1;
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