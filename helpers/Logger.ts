import {LoggerFactory, LoggerFactoryOptions, LFService, LogGroupRule, LogLevel} from "typescript-logging";


const options = new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp("Communication.+"), LogLevel.Debug))
    .addLogGroupRule(new LogGroupRule(new RegExp("Main.+"), LogLevel.Debug))
    .addLogGroupRule(new LogGroupRule(new RegExp("Main.+"), LogLevel.Error))
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));

export const factory = LFService.createNamedLoggerFactory("LoggerFactory", options);