import { Enricher, LoggerOptions, LOG_LEVEL_PRIORITY } from "./types";
import { formatMessage } from "./formatter";

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

  protected applyEnrichers(properties: any = {}) {
    return this.enrichers.reduce(
      (acc, fn) => ({ ...acc, ...fn(acc) }),
      properties
    );
  }

  public dispatch(
    level: LogLevel,
    logValue: string | Error | undefined,
    message: string,
    properties: any
  ) {
    if (level === "error" && logValue instanceof Error) {
      this.sendError(logValue, message, properties);
    } else {
      this.sendLog(level, message, properties);
    }
  }

  protected shouldLog(level: LogLevel) {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  protected log(level: LogLevel, logValue: any, ...args: any[]) {
    if (!this.shouldLog(level)) return;

    let error: Error | undefined;
    let template: string;
    let values: any[];

    if (logValue instanceof Error) {
      error = logValue;
      template = args.shift() ?? error.message;
      values = args;
    } else {
      template = logValue;
      values = args;
    }

    const { message, props } = formatMessage(template, values);

    if (error) {
      this.sendError(error, message, { ...props });
    } else {
      this.sendLog(level, message, { ...props });
    }
  }

  trace(message: string, ...args: any[]): void {
    this.log("trace", message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  error(error: Error, message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  error(...args: [any, ...any[]]): void {
    if (args[0] instanceof Error) {
      const [err, message, ...rest] = args;
      this.log("error", err, message, ...rest);
    } else if (typeof args[0] === "string") {
      const [message, ...rest] = args;
      this.log("error", message, ...rest);
    } else {
      this.log("error", "Invalid error log input", { input: args[0] });
    }
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

  protected abstract sendError(
    error: string | Error,
    message: string,
    properties: any
  ): void;

  public clone(options?: LoggerOptions): this {
    const ctor = this.constructor as { new (opts?: LoggerOptions): any };
    const cloned = new ctor(options) as this;
    return this.copyBaseProps(cloned);
  }
}

class DispatchLogger extends BaseLogger {
  constructor(private sinks: BaseLogger[]) {
    super();
  }

  protected sendLog(level: LogLevel, message: string, props: any) {
    this.sinks.forEach((s) => s.dispatch(level, undefined, message, props));
  }

  protected sendError(err: Error, message: string, props: any) {
    this.sinks.forEach((s) => s.dispatch("error", err, message, props));
  }
}

export { BaseLogger, DispatchLogger };
