const EventEmitter = require('events');
const LogService = require('./Service/LogService');
const SmartSocket = require('./Comunication/SmartSocket');
const SessionService = require('./Service/SessionService');
const KeepAliveService = require('./Service/KeepAliveService');
const DataService = require('./Service/DataService');
const DataStore = require('./DataStore/DataStore');
const MessageHandler = require('./Comunication/MessageHandler');
const Events = require('./Helpers/Events');
const FileSystem = require('fs');

let defaultConfig = {
    sessionConfig: {
        username: 'admin',
        password: 'admin',
        cSymbol: 'D19015',
        cSymbolAddon: 'i',
        shcVersion: '2.14.5',
        shApiVersion: '2.13'
    },
    smartSocketConfig: {
        host: '10.10.80.150',
        port: '4300',
        certificate: FileSystem.readFileSync('./Comunication/CA.pem')
    }
};

class SchellenbergApi extends EventEmitter {

    constructor(inConfig, debugLog) {
        super();
        this.debugLog = debugLog;
        if (inConfig) {
            this.mainConfig = inConfig;
        } else {
            this.mainConfig = defaultConfig;
        }
        this.logService = new LogService(this.debugLog);
        this.dataStore = new DataStore();

        this._setupServices();
        this._setupSocket();
    }

    _reinitializePartly() {
        if (this.keepAliveService) {
            this.keepAliveService.stopKeepAlive();
        }

        this._setupServices();
        this._setupSocket();
    }

    _reinitializeCompletly() {

    }

    _setupServices() {
        this.mainSocket = new SmartSocket(this.mainConfig.smartSocketConfig, this.logService);
        this.sessionService = new SessionService(this.mainSocket, this.mainConfig.sessionConfig);
        this.keepAliveService = new KeepAliveService(this.mainSocket);
        this.dataService = new DataService(this.mainSocket, this.sessionService, this.dataStore, this.logService);
    }

    _setupSocket() {
        this.handler = new MessageHandler(4000, this.dataService, this._reinitializePartly, this.logService);
        this.mainSocket.setupSocket(this.handler)
            .then(() => {
                console.log('connected');
                return this.sessionService.requestSession();
            })
            .catch((error) => {
                console.log('miau');
                console.log(error);
            })
            .then(() => {
                console.log(this.sessionService.sessionID);

                this.dataService.refreshDataNormal();
                this.keepAliveService.startKeepAlive();

            })
            .catch((error) => {
                console.log('wau');
                console.log(error);
            });

    }

}

module.exports = SchellenbergApi;