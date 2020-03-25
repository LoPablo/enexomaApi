//DataStore.js
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Store Class for Data received from Gateway
//--------------------------------------------------

class DataStore {
    constructor() {
        this.deviceMap = new Map();
        this.deviceValueMap = new Map();
        this.translationMap = new Map();
        this.compatibilityConfigurationMap = new Map();
        this.lastTimestamp = '0';
        this.lastCompatibilityConfigVersion = '0';
        this.lastLanguageTranslationVersion = '0';
    }
}

module.exports = DataStore;