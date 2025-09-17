import { Enricher, LoggerOptions, LOG_LEVEL_PRIORITY } from "./types";

abstract class BaseLogger {
  protected componentName?: string;
  protected environment?: string;
  protected level!: LogLevel;
  protected enrichers: Enricher[] = [];

  constructor(options?: LoggerOptions) {
    this.componentName = options?.componentName;
  }

  setLogLevel(level: LogLevel) {
    this.level = level;
  }

  setEnvironment(environment: string) {
    this.environment = environment;
  }

  setEnricher(enricher: Enricher) {
    this.enrichers.push(enricher);
    return this;
  }

  public dispatch(level: LogLevel, message: string | Error, properties: any) {
    if (level === "error") {
      this.sendError(message, properties);
    } else {
      this.sendLog(level, String(message), properties);
    }
  }

  protected shouldLog(level: LogLevel) {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  protected log(level: LogLevel, message: string | Error, properties?: any) {
    if (!this.shouldLog(level)) return;

    const hasProps = properties !== undefined;

    if (level === "error") {
      this.sendError(message, hasProps ? properties : {});
    } else {
      this.sendLog(level, String(message), hasProps ? properties : {});
    }
  }

  trace(message: string, properties?: any) {
    this.log("trace", message, properties);
  }

  debug(message: string, properties?: any) {
    this.log("debug", message, properties);
  }

  info(message: string, properties?: any) {
    this.log("info", message, properties);
  }

  warn(message: string, properties?: any) {
    this.log("warn", message, properties);
  }

  error(err: string | Error, properties?: any) {
    this.log("error", err, properties);
  }

  protected copyBaseProps<T extends BaseLogger>(target: T): T {
    target.enrichers = [...this.enrichers];
    target.level = this.level;
    target.environment = this.environment;
    return target;
  }

  protected abstract sendLog(
    level: LogLevel,
    message: string,
    properties: any
  ): void;

  protected abstract sendError(error: string | Error, properties: any): void;

  public abstract clone(options?: LoggerOptions): this;
}

class CompositeLogger extends BaseLogger {
  constructor(private sinks: BaseLogger[]) {
    super();
  }

  protected sendLog(level: LogLevel, message: string, props: any) {
    this.sinks.forEach((s) => s.dispatch(level, message, props));
  }

  protected sendError(err: string | Error, props: any) {
    this.sinks.forEach((s) => s.dispatch("error", err, props));
  }

  clone(): this {
    return new CompositeLogger(this.sinks.map((s) => s.clone())) as this;
  }
}

export { BaseLogger, CompositeLogger };
