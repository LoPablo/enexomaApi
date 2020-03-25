//SchellenbergApi.js
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Main file
//--------------------------------------------------

const EventEmitter = require('events');
const LogService = require('./Service/LogService');
const SmartSocket = require('./Comunication/SmartSocket');
const SessionService = require('./Service/SessionService');
const KeepAliveService = require('./Service/KeepAliveService');
const DataStore = require('./DataStore/DataStore');
const MessageHandler = require('./Comunication/DataHandler');
const Events = require('./Helpers/Events');

var myInstance = null;
var myConfig = null;
var myLog;

class SchellenbergApi extends EventEmitter {

    static configureInstance(inConfig, debugLog) {
        myConfig = inConfig;
        myLog = debugLog;
    }

    static getInstance() {
        if (myInstance) {
            return myInstance
        } else {
            myInstance = new SchellenbergApi(myConfig, myLog);
            return myInstance
        }
    }

    static renewInstance() {
        if (myInstance) {
            myInstance.reinitialize();
        }
    }

    constructor(inConfig, debugLog) {
        super();
        this.debugLog = debugLog;
        if (!inConfig) {
            return;
        }
        this.mainConfig = inConfig;
        this.logService = new LogService(this.mainConfig.debugConfig);
        this.attemptCount = 1;
        this.setupServices();
        this.setupSocket();
        this.setupEvents();
    }

    reinitialize() {
        this.logService.debug('ReinitializePartly called. Will Reinitialize in one second');
        const instance = this;
        setTimeout(() => {
            if (this.keepAliveService) {
                this.keepAliveService.stopKeepAlive();
            }
            instance.setupServices();
            instance.setupSocket();
            instance.setupEvents();
        }, 1000);
    }

    setupServices() {
        this.dataStore = new DataStore();
        this.mainSocket = new SmartSocket(this.mainConfig.smartSocketConfig, this.logService);
        this.sessionService = new SessionService(this.mainSocket, this.mainConfig.sessionConfig, this.logService);
        this.keepAliveService = new KeepAliveService(this.mainSocket);
        this.handler = new MessageHandler(4000, this.sessionService, this.dataStore, this.mainSocket, this.logService);

    }

    setupEvents() {
        //Wrapping Events from the dataService, so when data Service gets reinitialized, the events dont drop
        //for objects outside wanting to recieve Events
        const instance = this;
        this.handler.on(Events.disconnected, () => {
            SchellenbergApi.renewInstance();
        });
        this.handler.on(Events.apiError, (error) => {
            instance.logService.debugLog(error, this);
        });
        this.handler.on(Events.jsonParseError, (error) => {
            instance.logService.debugLog(error, this);
        });
        this.handler.on(Events.internalError, (error) => {
            instance.logService.debugLog(error, this);
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
                this.sessionService.requestSession()
                    .then(() => {
                        this.logService.debug("Session ID: " + this.sessionService.sessionID, this);
                        this.handler.refreshDataNormal();
                        this.keepAliveService.startKeepAlive();
                        this.attemptCount = 1;
                        this.emit(Events.connected);
                    })
                    .catch((error) => {
                        this.logService.error(error, this);
                        this.handler.disconnectHandler();
                    });
            })
            .catch((error) => {
                const instance = this;
                if (instance.attemptCount < 6) {
                    this.logService.error(error);
                    this.logService.error("There was an Error setting up the socket, trying again in one minute (Attempt " + this.attemptCount + " of 5).", this);
                    setTimeout(() => {
                        instance.attemptCount += 1;
                        if (instance.attemptCount < 6) {
                            instance.reinitialize();
                        }

                    }, 60000);
                } else {
                    this.logService.error("There was an Error setting up the socket, quitting.", this)
                }

            });


    }

}

module.exports = SchellenbergApi;