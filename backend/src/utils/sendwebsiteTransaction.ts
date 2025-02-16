import axios from "axios";
import canonicalize from 'canonicalize';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { parseEther } from 'viem'
import getAuthorizationSignature from "./AuthSign";

dotenv.config();
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;


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

export default async function sendwebtransaction(walletId: string, transaction: TransactionParams): Promise<TransactionResponse> {
  console.log("Starting transaction process...");
  
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
    }),
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