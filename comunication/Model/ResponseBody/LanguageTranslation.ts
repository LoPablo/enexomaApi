export default class LanguageTranslation {

    key?: string
    value?: string

    constructor(key?: string, value?: string) {
        this.key = key;
        this.value = value
    }

    static fromObject(object: any): LanguageTranslation {
        return new LanguageTranslation(
            object.key,
            object.value
        );
    }

}