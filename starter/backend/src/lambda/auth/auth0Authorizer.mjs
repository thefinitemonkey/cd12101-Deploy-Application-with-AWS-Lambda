import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = `https://${process.env.TODOS_APP_AUTH0_DOMAIN}/.well-known/jwks.json`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // Log debug information
  logger.info('Decoded JWT', { jwt });

  // Return token verification result
  const key = await getKey(jwt);
  if (!key) {
    throw new Error('Unable to find signing key');
  }

  // Log debug information
  logger.info('Audience and issuer', { audience: process.env.TODOS_APP_AUTH0_AUDIENCE, domain: process.env.TODOS_APP_AUTH0_DOMAIN});

  // Verify the token using the signing key
  const result = await jsonwebtoken.verify(token, key, {
    algorithms: ['RS256'],
    audience: process.env.TODOS_APP_AUTH0_AUDIENCE,
    issuer: `https://${process.env.TODOS_APP_AUTH0_DOMAIN}/`
  });
  
  // Log debug information
  logger.info('Verified token', { result });

  return result;
}

function getToken(authHeader) {
  // Log debug information
  logger.info('Verifying auth header', { authHeader });
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  // Log debug information
  logger.info('Extracted token', { token });
  return token
}

async function getKey(jwt) {
  // Get the kid from the JWT header
  const { kid } = jwt.header;

  // Fetch the JWKS from Auth0
  const response = await Axios.get(jwksUrl);
  if (response.status !== 200) {
    throw new Error('Unable to fetch JWKS');
  }

  // Log debug information
  logger.info('Fetched JWKS', { response });

  const keys = response.data.keys;

  // Find the key matching the kid
  const signingKey = keys.find((key) => key.kid === kid);
  if (!signingKey) {
    throw new Error('Unable to find signing key');
  }
  // Log debug information
  logger.info('Found signing key', { signingKey });

  const cert = jwkToPem(signingKey);
  // Log debug information
  logger.info('Converted signing key to PEM', { cert });

  // If key is in PEM format, convert to certificate with proper line breaks
  //const cert = signingKey.x5c[0]
  //  .match(/.{1,64}/g) // Split the certificate into lines of 64 characters
  //  .join('\n'); // Join the lines with newline characters

  //return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;
  return cert;
}