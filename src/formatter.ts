export function formatMessage(template: string, args: any[]) {
  const props: Record<string, any> = {};
  const usedIndexes = new Set<number>();

  const message = template.replace(/{(@?\w+)}/g, (_, rawKey) => {
    const shouldSerialize = rawKey.startsWith("@");
    const key = shouldSerialize ? rawKey.slice(1) : rawKey;

    let value: any;
    
    // positional placeholder
    if (/^\d+$/.test(key)) {
      const index = parseInt(key, 10);
      value = args[index];
      props[`arg${index}`] = value;
      usedIndexes.add(index);
    } else {
      // named placeholder
      const index = args.findIndex((_, i) => !usedIndexes.has(i));
      value = args[index];
      props[key] = value;
      usedIndexes.add(index);
    }

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

  // add extra args that weren’t used by placeholders
  args.forEach((arg, i) => {
    if (!usedIndexes.has(i)) {
      if (arg && typeof arg === "object" && !Array.isArray(arg)) {
        Object.assign(props, arg);
      } else {
        props[`arg${i}`] = arg;
      }
    }
  });

  return { message, props };
}
