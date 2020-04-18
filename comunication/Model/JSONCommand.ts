//JSONCommand.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for easily gernating JSON Commands
//--------------------------------------------------

export default class JSONCommand {

    command: string;
    sessionID?: string;

    public constructor(methode: string) {
        this.command = methode;
    }

    public toString(sessionID?: string): string {
        if (sessionID) {
            this.sessionID = sessionID;
        }
        return JSON.stringify(this);
    }
}
