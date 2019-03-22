//TODO: NEEDS FINISHING

class CompatibilityConfigService {

    constructor(inCompatibilityConfigMap) {
        this.version = 0;
        this.compatibilityConfigMap = inCompatibilityConfigMap;
    }

    newVersion(inCompatibilityConfig) {
        if (inCompatibilityConfig.compatibilityConfigurationVersion && inCompatibilityConfig.compatibilityConfigurationVersion > this.version && inCompatibilityConfig.compatibleRadioStandards) {
            this.version = inCompatibilityConfig.compatibilityConfigurationVersion;
            for (let i = 0; i < inCompatibilityConfig.compatibleRadioStandards.length; i++) {
                const workingConfig = inCompatibilityConfig.compatibleRadioStandards[i];
                if (workingConfig.compatibleDevices) {
                    for (let a = 0; a < workingConfig.compatibleDevices.length; a++) {
                        if (workingConfig.compatibleDevices[a].deviceDesignation && workingConfig.compatibleDevices[a].deviceType) {
                            this.compatibilityConfigMap.set(workingConfig.compatibleDevices[a].deviceDesignation, workingConfig.compatibleDevices[a].deviceType);
                        }
                    }
                }

            }
        }
        return this.version;
    }

    //TODO: use regex instead or maybe another representation
    isPossibleValues(inDevice, inValue) {
        const instance = this;
        let reIs = false;
        if (inDevice) {
            const localType = this.getCompatibilityConfig(inDevice.deviceDesignation);
            if (localType && localType.model) {
                switch (localType.model) {
                    case 'listbox':
                        if (localType.switchingValues) {
                            let possibleValues = {};
                            for (let i = 0; i < localType.switchingValues.length; i++) {
                                if (localType.switchingValues[i].value) {
                                    possibleValues.push(localType.switchingValues[i].value)
                                }
                            }
                            if (possibleValues.contains(inValue)) {
                                reIs = true;
                            }
                        }
                        break;
                    case 'text':
                        //TODO:implement;
                        break;
                    case 'analog':
                        //TODO:implement;
                        break;
                }
            }
        }
        return reIs;
    }

    getKind(inDeviceDesignation) {
        const localType = this.getCompatibilityConfig(inDeviceDesignation);
        let retKind = 'undefined';
        if (localType && localType.kind) {
            retKind = localType.kind;
        }
        return retKind;
    }

    getCompatibilityConfig(inDeviceDesignation) {
        let retType = null;
        if (this.compatibilityConfigMap.has(inDeviceDesignation)) {
            retType = this.compatibilityConfigMap.get(inDeviceDesignation);
        }
        return retType;
    }

}

module.exports = CompatibilityConfigService;