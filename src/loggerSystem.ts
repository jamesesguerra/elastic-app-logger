import { BaseLogger } from "./baseLogger";
import { Enricher } from "./types";
import { CompositeLogger } from "./baseLogger";

export default class LoggerSystem {
  constructor(
    private level: LogLevel,
    private environment: string | undefined,
    private enrichers: Enricher[],
    private sinks: BaseLogger[]
  ) {}

  createLogger(componentName: string): BaseLogger {
    const clones = this.sinks.map(s => {
      const clone = s.clone({ componentName });
      clone.setLogLevel(this.level);
      if (this.environment) clone.setEnvironment(this.environment);
      this.enrichers.forEach(e => clone.setEnricher(e));
      return clone;
    });

    const compositeLogger = new CompositeLogger(clones);
    compositeLogger.setLogLevel(this.level);

    return compositeLogger;
  }
}