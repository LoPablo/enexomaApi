import {LoggerFactory, LoggerFactoryOptions, LFService, LogGroupRule, LogLevel} from "typescript-logging";


const options = new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp("Communication.+"), LogLevel.Debug))
    .addLogGroupRule(new LogGroupRule(new RegExp("Main.+"), LogLevel.Debug))
    .addLogGroupRule(new LogGroupRule(new RegExp("Main.+"), LogLevel.Error))
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));

// Create a named loggerfactory and pass in the options and export the factory.
// Named is since version 0.2.+ (it's recommended for future usage)
export const factory = LFService.createNamedLoggerFactory("LoggerFactory", options);