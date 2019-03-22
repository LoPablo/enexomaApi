class Command {

    constructor(inCommand) {
        this.command = inCommand;
        this.sessionID = null;
    }

    toString(inSession) {
        this.sessionID = inSession;
        return JSON.stringify(this);
    }
}

module.exports = Command;