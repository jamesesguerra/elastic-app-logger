import { apm } from "@elastic/apm-rum";
import { BaseLogger } from "./baseLogger";
import { ElasticApiConfig, ElasticApiLoggerOptions, IEnrichedLogger, LoggerOptions } from "./types";
import serializer from "./serializer";

class ConsoleLogger extends BaseLogger {
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

class ElasticApmLogger extends BaseLogger implements IEnrichedLogger {
  protected sendLog(level: LogLevel, message: string, properties: any): void {
    if (!apm)
      throw new Error("APM instance is not initialized. Call initApm first.");
    
    const transaction = apm.startTransaction(message, "log");
    if (!transaction) return;
    
    transaction.addLabels({
      message,
      level,
      ...this.addEnrichments(properties),
    });
    
    setTimeout(() => transaction.end(), 500);
  }
  
  protected sendError(error: string | Error, message: string, properties: any): void {
    apm.captureError(error, {
      labels: {
        level: 'error',
        message,
        ...this.addEnrichments(properties),
      },
    });
  }

  addEnrichments(properties: any = {}) {
    const base = {
      component: this.componentName,
      url: window?.location.href,
      userAgent: navigator.userAgent,
      environment: this.environment,
      ...properties,
    };

    const enriched = this.applyEnrichers(base);
    return serializer.serialize(enriched);
  }
}

class ElasticApiLogger extends BaseLogger implements IEnrichedLogger {
  private config?: ElasticApiConfig;

  constructor(config: ElasticApiConfig);
  constructor(options?: ElasticApiLoggerOptions);

  constructor(arg?: ElasticApiConfig | ElasticApiLoggerOptions) {
    if (arg && "indexName" in arg) {
      super();
      this.config = arg;
    } else {
      super(arg);
      this.config = arg?.config;
    }
  }

  protected sendLog(level: LogLevel, message: string, properties: any): void {
    this.sendToElastic(level, message, properties);
  }

  protected sendError(error: string | Error, message: string, properties: any): void {
    if (typeof error === "string") {
      this.sendToElastic("error", error, {
        message,
        ...properties,
      });
    } else {
      this.sendToElastic("error", message, {
        error: {
          type: error.name,
          message: error.message,
          stack_trace: error.stack,
        },
        ...properties,
      });
    }
  }

  addEnrichments(properties: any = {}) {
    const base = {
      component: this.componentName,
      environment: this.environment,
      ...properties,
    };

    const enriched = this.applyEnrichers(base);
    return enriched;
  }

  private async sendToElastic(
    level: string,
    message: string,
    properties: any = {}
  ) {
    try {
      await fetch(`${this.config!.serverUrl}${this.config!.indexName}/_doc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("elastic:changeme"),
        },
        body: JSON.stringify({
          "@timestamp": new Date().toISOString(),
          level,
          message,
          ...this.addEnrichments(properties),
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  public override clone(options?: LoggerOptions): this {
    const ctor = this.constructor as { new (opts?: ElasticApiLoggerOptions): any };
    const cloned = new ctor({
      ...options,
      config: this.config!, // preserve custom config
    }) as this;

    return this.copyBaseProps(cloned);
  }
}

export { ConsoleLogger, ElasticApmLogger, ElasticApiLogger }