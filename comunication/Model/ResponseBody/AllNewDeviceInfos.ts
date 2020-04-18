//JSONAllNewDeviceInfo.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for Response answers
//--------------------------------------------------

import JSONHelper from "../JSONHelper";
import NewCompatibilityConfiguration from "./NewCompatibilityConfiguration";
import NewDeviceInfos from "./NewDeviceInfos";
import NewDeviceValues from "./NewDeviceValues";
import NewLanguageTranslation from "./NewLanguageTranslation";


export default class AllNewDeviceInfos {

    currentTimestamp?: Date;
    newCompatibilityConfiguration?: NewCompatibilityConfiguration;
    newDeviceInfos?: NewDeviceInfos;
    newDeviceValues?: NewDeviceValues;
    newLanguageTranslations?: NewLanguageTranslation;

    constructor(currentTimestamp?: Date, newCompatibilityConfiguration?: NewCompatibilityConfiguration, newDeviceInfos?: NewDeviceInfos, newDeviceValues?: NewDeviceValues, newLanguageTranslation?: NewLanguageTranslation) {
        this.currentTimestamp = currentTimestamp;
        this.newCompatibilityConfiguration = newCompatibilityConfiguration;
        this.newDeviceInfos = newDeviceInfos;
        this.newDeviceValues = newDeviceValues;
        this.newLanguageTranslations = newLanguageTranslation;
    }

    static fromObject(object: any): AllNewDeviceInfos {
        return new AllNewDeviceInfos(
            JSONHelper.stringToDate(object.currentTimestamp),
            NewCompatibilityConfiguration.fromObject(object.newCompatibilityConfiguration),
            NewDeviceInfos.fromObject(object.newDeviceInfos),
            NewDeviceValues.fromObject(object.newDeviceValues),
            NewLanguageTranslation.fromObject(object.newLanguageTranslation)
        );
    }

}