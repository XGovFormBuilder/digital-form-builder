import { Data } from "../data-model";

export const serialiseAndDeserialise = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const clone = <T>(obj: T): T => {
  if (obj instanceof Data) {
    return (obj as any).clone();
  }

  return serialiseAndDeserialise<T>(obj);
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
