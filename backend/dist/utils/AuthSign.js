"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getAuthorizationSignature;
const canonicalize_1 = __importDefault(require("canonicalize")); // Support JSON canonicalization
const crypto_1 = __importDefault(require("crypto")); // Support P-256 signing
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;
function getAuthorizationSignature({ url, body, method }) {
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
