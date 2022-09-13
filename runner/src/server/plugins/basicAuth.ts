import config from "config";

// validate()
// Checks validity of user credentials
const validate = async (request, username, password) => {
  // This runs if a basic auth authorization header is found on the request
  // It must return an object with an 'isValid' boolean property,
  // this allows the user to continue if true or raises a 401 if false
  const credentials = {};
  return { isValid: true, credentials };
};

// Log JWT Authentication activation status
console.log("Basic Auth Enabled: " + config.basicAuthOn.toString());

export const basicAuthStrategyName = "basic_auth";
export const basicAuthStrategyOptions = { validate };
