//JSONCommand.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Wrapper for easily gernating JSON Commands
//--------------------------------------------------

export default class JSONCommand {

    command: string;
    sessionId?: string;

    public constructor(methode: string) {
        this.command = methode;
    }

    public toString(sessionId?: string): string {
        if (sessionId) {
            this.sessionId = sessionId
        }
        return JSON.stringify(this);
    }
}
