"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendEthTransaction;
const axios_1 = __importDefault(require("axios"));
const canonicalize_1 = __importDefault(require("canonicalize"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
dotenv_1.default.config();
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;
function getAuthorizationSignature({ url, body, method, idempotencyKey }) {
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
    const serializedPayload = (0, canonicalize_1.default)(payload);
    const serializedPayloadBuffer = Buffer.from(serializedPayload);
    // Replace this with your app's authorization key. We remove the 'wallet-auth:' prefix
    // from the key before using it to sign requests
    const privateKeyAsString = PRIVY_AUTHORIZATION_KEY === null || PRIVY_AUTHORIZATION_KEY === void 0 ? void 0 : PRIVY_AUTHORIZATION_KEY.replace('wallet-auth:', '');
    // Convert your private key to PEM format, and instantiate a node crypto KeyObject for it
    const privateKeyAsPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyAsString}\n-----END PRIVATE KEY-----`;
    const privateKey = crypto_1.default.createPrivateKey({
        key: privateKeyAsPem,
        format: 'pem',
    });
    // Sign the payload buffer with your private key and serialize the signature to a base64 string
    const signatureBuffer = crypto_1.default.sign('sha256', serializedPayloadBuffer, privateKey);
    const signature = signatureBuffer.toString('base64');
    console.log(signature);
    return signature;
}
function sendEthTransaction(walletId, transaction, idempotencyKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
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
        console.log("wallet Id: ", walletId);
        const value = (0, viem_1.parseEther)(String(transaction.value));
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
        }
        catch (error) {
            console.log(error);
        }
        const method = 'POST';
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
            const response = yield axios_1.default.post(url, requestBody, { headers });
            console.log('Transaction sent successfully!');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.log('Error Response:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
            else {
                console.error('Unexpected error:', error);
            }
            throw error;
        }
    });
}
