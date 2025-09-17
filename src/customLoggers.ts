import { BaseLogger } from "./baseLogger";
import { InitElasticApmOptions, LoggerOptions } from "./types";

export class ConsoleLogger extends BaseLogger {
  protected sendLog(level: LogLevel, message: string, properties: any) {
    const hasProps = Object.keys(properties || {}).length > 0;

    switch (level) {
      case "trace":
        hasProps ? console.trace(message, properties) : console.trace(message);
        break;
      case "debug":
        hasProps ? console.debug(message, properties) : console.debug(message);
        break;
      case "info":
        hasProps ? console.info(message, properties) : console.info(message);
        break;
      case "warn":
        hasProps ? console.warn(message, properties) : console.warn(message);
        break;
    }
  }

  protected sendError(err: string | Error, properties: any) {
    const hasProps = Object.keys(properties || {}).length > 0;
    hasProps ? console.error(err, properties) : console.error(err);
  }
}

export class ElasticApmLogger extends BaseLogger {
  constructor(private options: InitElasticApmOptions) {
    super();
  }

  protected sendLog(level: LogLevel, message: string, properties: any): void {
    throw new Error("Method not implemented.");
  }

  protected sendError(error: string | Error, message: string, properties: any): void {
    throw new Error("Method not implemented.");
  }
}