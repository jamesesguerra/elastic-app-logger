import LoggerConfiguration from "./configuration";

export type Enricher = (meta: Record<string, any>) => Record<string, any>;

export interface LoggerOptions {
  componentName?: string;
}

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
};

export type MinimumLevelAPI = {
  trace: () => LoggerConfiguration;
  debug: () => LoggerConfiguration;
  info: () => LoggerConfiguration;
  warn: () => LoggerConfiguration;
  error: () => LoggerConfiguration;
};