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

// keyFunc returns the key and any additonal context required to
// passed to validate function (below) to validate signature
// this is normally used to look up keys from list in a multi-tenant scenario
const keyFunc = async function (decoded) {
  const key = Buffer.from(config.rsa256PublicKeyBase64 ?? "", "base64");
  console.log(
    "Verifying token: '" +
      JSON.stringify(decoded) +
      "' with public key: '" +
      config.rsa256PublicKeyBase64 +
      "'"
  );
  return { key, additional: decoded };
};

// validate()
// Checks validity of user credentials
const validate = async function (decoded, request, h) {
  // This runs if the jwt signature is verified
  // It must return an object with an 'isValid' boolean property,
  // this allows the user to continue if true or raises a 401 if false
  const credentials = decoded;
  if (request.plugins["hapi-auth-jwt2"]) {
    credentials.extraInfo = request.plugins["hapi-auth-jwt2"].extraInfo;
  }
  if (!decoded.accountId) {
    request.logger.error(
      "JWT token has no accountID in jwt: " + credentials.extraInfo.toString()
    );
    return { isValid: false };
  } else {
    return { isValid: true, credentials };
  }
};

// rsa256Options()
// Returns configuration options for rsa256 auth strategy
export function rsa256Options(jwtAuthCookieName, rsa256PublicKeyBase64) {
  console.log(
    "Validating jwt in cookie name '" +
      jwtAuthCookieName +
      "' with RSA256 base64 key '" +
      rsa256PublicKeyBase64 +
      "' decoded to key '" +
      Buffer.from(rsa256PublicKeyBase64 ?? "", "base64").toString() +
      "'"
  );
  return {
    key: keyFunc,
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
