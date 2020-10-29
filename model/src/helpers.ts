export const serialiseAndDeserialise = (obj: { [prop: string]: any }) => {
  return JSON.parse(JSON.stringify(obj));
};

export const clone = (obj: { [prop: string]: any }) => {
  if (obj) {
    if (typeof obj.clone === "function") {
      return obj.clone();
    }

    return serialiseAndDeserialise(obj);
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
