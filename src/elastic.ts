import { init, ApmBase, AgentConfigOptions } from "@elastic/apm-rum";
import { UserContext } from "./types";

let apmInstance: ApmBase | null = null;

export function initApm(options: AgentConfigOptions) {
  if (!apmInstance) {
    apmInstance = init({
      serviceName: options.serviceName,
      serverUrl: options.serverUrl,
      active: options.active ?? true,
      environment: options.environment ?? "development",
    });
  }

  return apmInstance;
}

export function setApmUserContext(user: UserContext) {
  if (!apmInstance) {
    console.warn("APM is not initialized. Call initializeApm first.");
    return;
  }

  const context: any = {
    ...user,
    id: user.id,
    username: user.username,
  };

  if (user.email?.includes("@")) {
    context.email = user.email;
  }

  apmInstance.setUserContext(context);
}

export function getApmInstance(): ApmBase {
  if (!apmInstance) {
    throw new Error(
      "APM instance is not initialized. Call initApm first."
    );
  }

  return apmInstance;
}

// always provide label getLogger()
// json config file appender consoleappender, apiappender, apmappender
// log4j, slf4j
// formatters
// parsing check if error is valid before parsing message
// withtimezone
// choose now npm registry? git submodule approach?