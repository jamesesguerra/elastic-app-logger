import LogLevel from "@elastic/apm-rum";
import { BaseLogger } from "./baseLogger";
import LoggerSystem from "./loggerSystem";
import { ConsoleLogger, ElasticApmLogger } from "./customLoggers";
import { InitElasticApmOptions, MinimumLevelAPI } from "./types";

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

  private setLogLevel(level: LogLevel) {
    this.level = level;
    return this;
  }

  withEnvironment(env: string) {
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

  withTimezone() {
    return this.withEnricher((_) => ({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    }));
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

  writeToElasticApm(options: InitElasticApmOptions) {
    this.sinks.push(new ElasticApmLogger(options));
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
