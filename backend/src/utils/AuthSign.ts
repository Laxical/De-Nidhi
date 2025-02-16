import canonicalize from 'canonicalize'; // Support JSON canonicalization
import crypto from 'crypto'; // Support P-256 signing
import dotenv from 'dotenv';
dotenv.config();
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;

export default function getAuthorizationSignature({url, body,method}: {url: string; body: object,method:string}) {

  const payload = {
    version: 1,
    method: method,
    url,
    body,
    headers: {
    'privy-app-id': process.env.PRIVY_APP_ID,
    }
  };

  // JSON-canonicalize the payload and convert it to a buffer
  const serializedPayload = canonicalize(payload) as string;
  const serializedPayloadBuffer = Buffer.from(serializedPayload);

  // Replace this with your app's authorization key. We remove the 'wallet-auth:' prefix
  // from the key before using it to sign requests
  const privateKeyAsString = PRIVY_AUTHORIZATION_KEY?.replace('wallet-auth:', '');

  // Convert your private key to PEM format, and instantiate a node crypto KeyObject for it
  const privateKeyAsPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyAsString}\n-----END PRIVATE KEY-----`;
  const privateKey = crypto.createPrivateKey({
    key: privateKeyAsPem,
    format: 'pem',
  });

  // Sign the payload buffer with your private key and serialize the signature to a base64 string
  const signatureBuffer = crypto.sign('sha256', serializedPayloadBuffer, privateKey);
  const signature = signatureBuffer.toString('base64');
  console.log(signature);
  return signature;
}
