import randomId from "../randomId";

export const tryParseInt = (val) => {
  let parsed = parseInt(val, 10);
  return isNaN(parsed) ? undefined : parsed;
};

export const isInt = (val) => {
  const int = parseInt(val, 10);
  return !isNaN(int);
};
