export const serialiseAndDeserialise = <T>(obj: T): T => {
  if (typeof obj === "object" && obj !== null) {
    return JSON.parse(JSON.stringify(obj));
  }

  return obj;
};

export const clone = <T>(obj: T & { clone?: () => T }): T => {
  if (obj) {
    if (typeof obj.clone === "function") {
      return obj.clone();
    }

    return serialiseAndDeserialise<T>(obj);
  }
  return obj;
};

export function filter<T>(
  obj: T,
  predicate: (value: any) => boolean
): Partial<T> {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value && predicate(value)) {
      result[key] = value;
    }
  }

  return result;
}
