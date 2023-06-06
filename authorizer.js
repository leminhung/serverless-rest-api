const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-1_5YeDwmvw7",
  tokenUse: "id",
  clientId: "4dfpiobenmqi04lmil96t5qfcj",
});

const generatePolicy = (principalId, effect, resource) => {
  var authReponse = {};
  authReponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: "execute-api:Invoke",
        },
      ],
    };
    authReponse.policyDocument = policyDocument;
  }
  authReponse.context = {
    foo: "bar",
  };
  console.log("authReponse--", JSON.stringify(authReponse));
  return authReponse;
};

exports.handler = async (event, context, callback) => {
  // lambda authorizer code
  var token = event.authorizationToken; // "allow" or "deny"
  console.log("Token:", token);

  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", JSON.stringify(payload));
    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch {
    console.log("Token not valid!");
    callback("Error: Invalid token");
  }
  // switch (token) {
  //   case "allow":
  //
  //     break;
  //   case "deny":
  //     callback(null, generatePolicy("user", "Deny", event.methodArn));
  //     break;
  //   default:
  //     callback("Error: Invalid token");
  // }
};
