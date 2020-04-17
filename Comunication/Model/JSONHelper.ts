export default class JSONHelper {
    static stringToDate(timestamp?: number): Date | undefined {
        if (timestamp) {
            let splitTimestamp = timestamp.toString().split(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
            return new Date(Number.parseInt(splitTimestamp[1]), Number.parseInt(splitTimestamp[2]), Number.parseInt(splitTimestamp[3]), Number.parseInt(splitTimestamp[4]), Number.parseInt(splitTimestamp[5]), Number.parseInt(splitTimestamp[6]));
        }
    }
}