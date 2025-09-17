import LogLevel from "@elastic/apm-rum";
import { BaseLogger } from "./baseLogger";
import LoggerSystem from "./loggerSystem";
import { ConsoleLogger } from "./customLoggers";
import { MinimumLevelAPI } from "./types";

type Enricher = (meta: Record<string, any>) => Record<string, any>;

export default class LoggerConfiguration {
  private enrichers: Enricher[] = [];
  private level: LogLevel = "info";
  private environment?: string;
  private sinks: BaseLogger[] = [];

  get minimumLevel(): MinimumLevelAPI {
    return {
      trace: () => this.setLogLevel("trace"),
      debug: () => this.setLogLevel("debug"),
      info: () => this.setLogLevel("info"),
      warn: () => this.setLogLevel("warn"),
      error: () => this.setLogLevel("error"),
    };
  }

  setLogLevel(level: LogLevel) {
    this.level = level;
    return this;
  }

  setEnvironment(env: string) {
    this.environment = env;
    return this;
  }

  withEnricher(enricher: Enricher) {
    this.enrichers.push(enricher);
    return this;
  }

  // convenience enrichers
  withMachineName() {
    return this.withEnricher((_) => ({
      machineName: window?.navigator?.platform || "unknown",
    }));
  }

  withUserAgent() {
    return this.withEnricher((_) => ({ userAgent: navigator.userAgent }));
  }

  withTimestamp() {
    return this.withEnricher((_) => ({ timestamp: new Date().toISOString() }));
  }

  withAppVersion(version: string) {
    return this.withEnricher((_) => ({ appVersion: version }));
  }

  // withtimezone

  // convenience appenders
  writeTo(sink: BaseLogger) {
    this.sinks.push(sink);
    return this;
  }

  writeToConsole() {
    this.sinks.push(new ConsoleLogger());
    return this;
  }

  build(): LoggerSystem {
    return new LoggerSystem(
      this.level,
      this.environment,
      this.enrichers,
      this.sinks
    );
  }
}
