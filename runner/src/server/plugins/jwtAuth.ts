import config from "config";

const isActivated = !(
  !config.rsa256PublicKeyBase64 || !config.jwtAuthCookieName
);

// Authorisation Function
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

// Auth strategy configuration options
export function rsa256Options(jwtAuthCookieName, rsa256PublicKeyBase64) {
  return {
    key: Buffer.from(rsa256PublicKeyBase64 ?? "", "base64"),
    validate,
    verifyOptions: {
      ignoreExpiration: true,
      algorithms: ["RS256"],
    },
    urlKey: false,
    cookieKey: jwtAuthCookieName,
  };
}

console.log("JWT Authentication Enabled: " + isActivated.toString());

export const jwtAuthStrategyName = "fsd_jwt_auth";
export const jwtStrategyOptions = rsa256Options;
