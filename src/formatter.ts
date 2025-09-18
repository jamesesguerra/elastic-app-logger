export function formatMessage(template: string, args: any[]) {
  const props: Record<string, any> = {};
  let argIndex = 0;

  const message = template.replace(/{(@?\w+)}/g, (_, rawKey) => {
    const shouldSerialize = rawKey.startsWith("@");
    const key = shouldSerialize ? rawKey.slice(1) : rawKey;

    const value = args[argIndex++];
    props[key] = value;

    if (shouldSerialize) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    } else {
      return String(value);
    }
  });

  for (; argIndex < args.length; argIndex++) {
    const extra = args[argIndex];
    if (extra && typeof extra === "object" && !Array.isArray(extra)) {
      Object.assign(props, extra);
    } else {
      props[`arg${argIndex}`] = extra;
    }
  }

  return { message, props };
}
