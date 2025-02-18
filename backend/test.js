const fetch = require('node-fetch');

const url = 'https://api-sandbox.circle.com/v1/businessAccount/banks/wires';
const options = {
  method: 'POST',
  headers: {
    Authorization: 'Bearer SAND_API_KEY:cc7f54adfc1dd1756240b71fabeff7cb:fad47df5e1853bca78d6c68102cf56f7',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bankAddress: {country: 'US'},
    billingDetails: {
      postalCode: '01234',
      district: 'MA',
      line1: '100',
      country: 'US',
      city: 'Boston',
      name: 'Satoshi Nakamoto'
    },
    routingNumber: '121000248',
    accountNumber: '12340011',
    idempotencyKey: '7264f50c-058a-4dc5-a332-ba4007f72d82'
  })
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));