import config from "config";

// jwtAuthIsActivated()
// Checks if all required config variables are set
export function jwtAuthIsActivated(
  jwtAuthCookieName,
  jwtRedirectToAuthenticationUrl,
  rsa256PublicKeyBase64
) {
  return !(
    !jwtAuthCookieName ||
    !jwtRedirectToAuthenticationUrl ||
    !rsa256PublicKeyBase64
  );
}

// validate()
// Checks validity of user credentials
const validate = async function (decoded, request, h) {
  // This runs if the jwt signature is verified
  // It must return an object with an 'isValid' boolean property,
  // this allows the user to continue if true or raises a 401 if false
  if (!decoded.accountId) {
    return { isValid: false };
  } else {
    return { isValid: true };
  }
};

// rsa256Options()
// Returns configuration options for rsa256 auth strategy
export function rsa256Options(jwtAuthCookieName, rsa256PublicKeyBase64) {
  return {
    key: Buffer.from(rsa256PublicKeyBase64 ?? "", "base64"),
    validate,
    verifyOptions: {
      algorithms: ["RS256"],
    },
    urlKey: false,
    cookieKey: jwtAuthCookieName,
  };
}

// Check if global config vars are set
const isActivated = jwtAuthIsActivated(
  config.jwtAuthCookieName,
  config.jwtRedirectToAuthenticationUrl,
  config.rsa256PublicKeyBase64
);
// Log JWT Authentication activation status
console.log("JWT Authentication Enabled: " + isActivated.toString());

export const jwtAuthStrategyName = "jwt_auth";
export const jwtStrategyOptions = rsa256Options;
