import { customAlphabet } from "nanoid";

/**
 * Custom alphabet is required because a number of formats of ID are invalid property names
 * and expr-eval (condition logic) will fail to execute.
 */
const randomId = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  6
);

export default randomId;
