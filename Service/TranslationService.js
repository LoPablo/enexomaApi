class TranslationService {

    constructor(inTranslationMap) {
        this.version = 0;
        this.translationMap = inTranslationMap;
    }

    newVersion(inNewLanguageTranslation) {
        if (inNewLanguageTranslation.languageTranslationVersion && inNewLanguageTranslation.languageTranslationVersion > this.version && inNewLanguageTranslation.newTranslatedStrings) {
            this.version = inNewLanguageTranslation.languageTranslationVersion;
            for (let i = 0; i < inNewLanguageTranslation.newTranslatedStrings.length; i++) {
                if (inNewLanguageTranslation.newTranslatedStrings[i].key && inNewLanguageTranslation.newTranslatedStrings[i].value) {
                    this.translationMap.set(inNewLanguageTranslation.newTranslatedStrings[i].key, inNewLanguageTranslation.newTranslatedStrings[i].value);
                }
            }
        }
        return this.version;
    }

    translateAllObjectKeys(inObject) {
        //TODO:IMPLEMENT
    }

    getCorrectedString(inString) {
        const instance = this;
        const regex = /\${(.*?)\}/gm;
        let localString = inString;
        if (inString) {
            let newLocations = inString.match(regex);
            if (newLocations) {
                newLocations.forEach((value) => {
                    const newValue = instance.getCorrectedString(instance.getKey(value.substring(2, value.length - 1)));
                    localString = localString.replace(value, newValue);
                });
            }
        }
        return localString;
    }

    getKey(inKey) {
        let retString = '';
        if (this.translationMap.has(inKey)) {
            retString = this.translationMap.get(inKey);
        }
        return retString;
    }

}

module.exports = TranslationService;