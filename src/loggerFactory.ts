import LoggerConfiguration from "./configuration";
import LoggerSystem from "./loggerSystem";
import { BaseLogger } from "./baseLogger";

export default class LoggerFactory {
  private static system: LoggerSystem;

  static configure(config: LoggerConfiguration) {
    LoggerFactory.system = config.build();
  }

  static getLogger(componentName: string): BaseLogger {
    if (!LoggerFactory.system) {
      throw new Error("LoggerFactory not configured. Call configure() first.");
    }
    return LoggerFactory.system.createLogger(componentName);
  }
}
