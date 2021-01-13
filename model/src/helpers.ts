export const serialiseAndDeserialise = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const clone = (obj) => {
  if (obj) {
    if (typeof obj.clone === "function") {
      return obj.clone();
    }
    return serialiseAndDeserialise(obj);
  }
  return obj;
};
