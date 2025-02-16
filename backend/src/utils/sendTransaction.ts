import axios from "axios";
import canonicalize from 'canonicalize';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { parseEther } from 'viem'

dotenv.config();
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;

function getAuthorizationSignature({url, body, method, idempotencyKey}: {url: string; body: object, method:string, idempotencyKey: string}) {

  const payload = {
    version: 1,
    method: method,
    url,
    body,
    headers: {
    'privy-app-id': process.env.PRIVY_APP_ID,
    'privy-idempotency-key': idempotencyKey
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
interface TransactionParams {
  to: string;
  value: number;
}

interface TransactionResponse {
  method: string;
  data: {
    hash: string;
    caip2: string;
  };
}

export default async function sendEthTransaction(walletId: string, transaction: TransactionParams, idempotencyKey: string): Promise<TransactionResponse> {
  console.log("Starting transaction process...");
  console.log("Idempotency-key: ", idempotencyKey);
  
  const privyAppId = process.env.PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
  
  if (!privyAppId || !privyAppSecret) {
    throw new Error("Missing Privy credentials in environment variables");
  }

  const url = `https://api.privy.io/v1/wallets/${walletId}/rpc`;
  
  // Base64 encode for basic authentication
  const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');

  console.log("transaction value: ", transaction.value);
  console.log("To Address: ", transaction.to);
  console.log("wallet Id: ",walletId);
  const value=parseEther(String(transaction.value));
  console.log(value);
  const hexValue = `0x${value.toString(16)}`;


  const requestBody = {
    chain_type: "ethereum",
    method: "eth_sendTransaction",
    caip2: "eip155:421614",
    idempotencyKey: idempotencyKey,
    params: {
      transaction: {
        to: transaction.to,
        value: hexValue,
        chain_id: 421614
      }
    }
  };

  try {
    console.log("Request payload:", JSON.stringify(requestBody, null, 2));
  } catch (error) {
    console.log(error);
  }
  const method='POST'

  const headers = {
    'privy-app-id': privyAppId,
    'Content-Type': 'application/json',
    'Authorization': authHeader,
    'privy-authorization-signature': getAuthorizationSignature({
      url,
      body: requestBody,
      method,
      idempotencyKey
    }),
    'privy-idempotency-key': idempotencyKey
  };

  console.log("Header: ", headers);

  try {
    const response = await axios.post<TransactionResponse>(url, requestBody, { headers });
    console.log('Transaction sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Error Response:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}