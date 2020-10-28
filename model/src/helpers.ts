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
