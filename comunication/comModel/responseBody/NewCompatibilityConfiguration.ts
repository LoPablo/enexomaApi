//NewCompatibilityConfiguration.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

export default class NewCompatibilityConfiguration {

    compatibilityConfigurationVersion?: number;


    constructor(compatibilityConfigurationVersion?: number) {
        this.compatibilityConfigurationVersion = compatibilityConfigurationVersion;
    }

    static fromObject(object: any): NewCompatibilityConfiguration {
        return new NewCompatibilityConfiguration(
            object.compatibilityConfigurationVersion
        );
    }

}