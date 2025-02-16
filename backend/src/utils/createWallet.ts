import axios from 'axios';
import * as fs from 'fs';
import dotenv from 'dotenv';
import getAuthorizationSignature from './AuthSign';

dotenv.config();

export default async function createWallet(policyIds: string) {
    const authorizationID = process.env.PRIVY_AUTHORIZATION_KEY_ID;
   const privyAppId = process.env.PRIVY_APP_ID;
   const privyAppSecret = process.env.PRIVY_APP_SECRET;
   const url = 'https://api.privy.io/v1/wallets';
   const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');
   const method='POST'
   const signature = getAuthorizationSignature({ url, body: { chain_type: 'ethereum', policy_ids: [policyIds], authorization_key_ids:[authorizationID]} ,method});

   try {
      const response = await axios.post(
         url,
         {
            chain_type: 'ethereum',
            policy_ids: [policyIds],
            authorization_key_ids:[authorizationID]  // Passing policyIds in the request body
         },
         {
            headers: {
               'privy-app-id': privyAppId,
               'privy-authorization-signature': signature,
               'Content-Type': 'application/json',
               Authorization: authHeader,
            },
         }
      );

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
      })

   } catch (error) {
      if (axios.isAxiosError(error)) {
         console.error('Error creating wallet:', error.response ? error.response.data : error.message);
      } else {
         console.error('Error creating wallet:', (error as any).message);
      }
   }
}
