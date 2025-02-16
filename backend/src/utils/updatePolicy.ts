import axios from "axios";
import dotenv from 'dotenv';
import getAuthorizationSignature from "./AuthSign";

dotenv.config();

interface PolicyCondition {
    field_source: string;
    field: string;
    operator: string;
    value: string;
}

interface PolicyRule {
    name: string;
    conditions: PolicyCondition[];
    action: 'ALLOW' | 'DENY';
}

interface MethodRule {
    method: string;
    rules: PolicyRule[];
}

interface UpdatePolicyData {
    method_rules: MethodRule[];
}

export default async function updatePolicy(policyId: string) {
    console.log(`Updating policy ${policyId}...`);
    const privyAppId = process.env.PRIVY_APP_ID;
    const privyAppSecret = process.env.PRIVY_APP_SECRET;
    
    if (!privyAppId || !privyAppSecret) {
        throw new Error('Missing Privy credentials in environment variables');
    }

    // Base64 encode for basic authentication
    const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');

    const url = `https://api.privy.io/v1/policies/${policyId}`;

    // Policy update data matching the curl example
    const updateData: UpdatePolicyData = {
        "method_rules": [{
          "method": "eth_sendTransaction",
          "rules": [{
            "name": "Allowlist USDT",
            "conditions": [
                {
                    "field_source": "ethereum_transaction",
                    "field": "to",
                    "operator": "eq",
                    "value": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
                },
            ],
            "action": "ALLOW"
          }],
        }],

    };
    const method='PATCH'

    // Prepare headers
    const headers = {
        'privy-app-id': privyAppId,
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'privy-authorization-signature': getAuthorizationSignature({url, body: updateData,method})
    };

    try {
        // Send the PATCH request
        const response = await axios.patch(url, updateData, { headers });
        const updatedPolicy = response.data;

        console.log('Policy updated successfully!');
        return updatedPolicy;
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error('Error updating policy:', errorMessage);
        throw error;
    }
}