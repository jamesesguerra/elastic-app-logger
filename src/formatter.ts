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

  return { message, props };
}
