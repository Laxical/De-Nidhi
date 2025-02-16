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
exports.default = createWallet;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthSign_1 = __importDefault(require("./AuthSign"));
dotenv_1.default.config();
function createWallet(policyIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const authorizationID = process.env.PRIVY_AUTHORIZATION_KEY_ID;
        const privyAppId = process.env.PRIVY_APP_ID;
        const privyAppSecret = process.env.PRIVY_APP_SECRET;
        const url = 'https://api.privy.io/v1/wallets';
        const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');
        const method = 'POST';
        const signature = (0, AuthSign_1.default)({ url, body: { chain_type: 'ethereum', policy_ids: [policyIds], authorization_key_ids: [authorizationID] }, method });
        try {
            const response = yield axios_1.default.post(url, {
                chain_type: 'ethereum',
                policy_ids: [policyIds],
                authorization_key_ids: [authorizationID] // Passing policyIds in the request body
            }, {
                headers: {
                    'privy-app-id': privyAppId,
                    'privy-authorization-signature': signature,
                    'Content-Type': 'application/json',
                    Authorization: authHeader,
                },
            });
            // Log the successful response data
            console.log('Wallet created successfully:');
            console.log('ID:', response.data.id);
            console.log('Address:', response.data.address);
            console.log('Chain Type:', response.data.chain_type);
            console.log('Policy IDs:', response.data.policy_ids);
            return ({
                id: response.data.id,
                address: response.data.address,
                chain_type: response.data.chain_type,
                policy_ids: response.data.policy_ids
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error creating wallet:', error.response ? error.response.data : error.message);
            }
            else {
                console.error('Error creating wallet:', error.message);
            }
        }
    });
}
