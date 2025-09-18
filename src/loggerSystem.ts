import { BaseLogger } from "./baseLogger";
import { Enricher } from "./types";
import { DispatchLogger } from "./baseLogger";

export default class LoggerSystem {
  constructor(
    private level: LogLevel,
    private environment: string,
    private enrichers: Enricher[],
    private sinks: BaseLogger[]
  ) {}

  createLogger(componentName: string): BaseLogger {
    const clones = this.sinks.map(s => {
      const clone = s.clone({ componentName });
      clone.setLogLevel(this.level);
      clone.setEnvironment(this.environment);
      this.enrichers.forEach(e => clone.setEnricher(e));
      return clone;
    });

    const dispatchLogger = new DispatchLogger(clones);
    dispatchLogger.setLogLevel(this.level);

    return dispatchLogger;
  }
}