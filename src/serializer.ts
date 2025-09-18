class PropertySerializer {
  serialize(properties: any) {
    const result: Record<string, string> = {};
    for (const key in properties) {
      const value = properties[key];
      result[key] =
        value && typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    }
    return result;
  }
}

const serializer = new PropertySerializer();
export default serializer;
