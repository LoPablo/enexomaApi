export default class JSONHelper {
    static stringToDate(timestamp?: number): Date | undefined {
        if (timestamp) {
            let splitTimestamp = timestamp.toString().split(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
            return new Date(Number.parseInt(splitTimestamp[1]), Number.parseInt(splitTimestamp[2]), Number.parseInt(splitTimestamp[3]), Number.parseInt(splitTimestamp[4]), Number.parseInt(splitTimestamp[5]), Number.parseInt(splitTimestamp[6]));
        }
    }

    static dateToString(date?: Date): string {
        if (date && date.getTime() > 0) {
            let returnNumber = 0;
            returnNumber += date.getFullYear();
            returnNumber *= 100;
            returnNumber += date.getMonth();
            returnNumber *= 100;
            returnNumber += date.getDay();
            returnNumber *= 100;
            returnNumber += date.getHours();
            returnNumber *= 100;
            returnNumber += date.getMinutes();
            returnNumber *= 100;
            returnNumber += date.getSeconds();
            return returnNumber.toString();
        } else {
            return "0";
        }
    }
}