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
exports.default = sendwebtransaction;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
const AuthSign_1 = __importDefault(require("./AuthSign"));
dotenv_1.default.config();
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;
function sendwebtransaction(walletId, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
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
        console.log("wallet Id: ", walletId);
        const value = (0, viem_1.parseEther)(String(transaction.value));
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
        }
        catch (error) {
            console.log(error);
        }
        const method = 'POST';
        const headers = {
            'privy-app-id': privyAppId,
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'privy-authorization-signature': (0, AuthSign_1.default)({
                url,
                body: requestBody,
                method,
            }),
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
