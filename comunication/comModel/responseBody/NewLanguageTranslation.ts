//NewLanguageTranslation.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------

import LanguageTranslation from "./LanguageTranslation";

export default class NewLanguageTranslation {

    languageTranslationVersion?: number;
    newTranslatedStrings?: LanguageTranslation[];

    constructor(languageTranslationVersion?: number, newTranslatedStrings?: LanguageTranslation[]) {
        this.languageTranslationVersion = languageTranslationVersion;
        this.newTranslatedStrings = newTranslatedStrings;
    }

    static fromObject(object: any): NewLanguageTranslation {
        let tempValues: LanguageTranslation[] = [];
        if (object.newTranslatedStrings && (typeof object.newTranslatedStrings[Symbol.iterator] === 'function')) {
            for (let valueEntry of object.newTranslatedStrings) {
                tempValues.push(LanguageTranslation.fromObject(valueEntry));
            }
        }
        return new NewLanguageTranslation(
            object.languageTranslationVersion,
            tempValues
        );
    }

}