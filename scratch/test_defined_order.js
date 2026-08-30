const crypto = require('crypto');
const https = require('https');

function phpUrlEncode(str) {
  return encodeURIComponent(str.trim())
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

// In Payfast, the HTML form parameters order in documentation vs alphabetical:
// Let's test with the EXACT PayFast field definition order vs sorted order:
// Merchant details: merchant_id, merchant_key, return_url, cancel_url, notify_url
// Buyer details: name_first, name_last, email_address, cell_number
// Transaction details: m_payment_id, amount, item_name, item_description
const payfastDefinedOrder = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'email_confirmation',
  'confirmation_address',
  'payment_method',
  'subscription_type',
  'billing_date',
  'recurring_amount',
  'frequency',
  'cycles'
];

function generateSignatureDefinedOrder(params, passphrase) {
  let paramString = '';
  payfastDefinedOrder.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      paramString += `${key}=${phpUrlEncode(val)}&`;
    }
  });
  let signatureString = paramString.slice(0, -1);
  if (passphrase) {
    signatureString += `&passphrase=${phpUrlEncode(passphrase)}`;
  }
  console.log('Signature String (Defined Order):', signatureString);
  const hash = crypto.createHash('md5').update(signatureString).digest('hex');
  console.log('MD5 Hash (Defined Order):', hash);
  return hash;
}

const params = {
  merchant_id: '10000100',
  merchant_key: '46f0cd694581a',
  return_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
  notify_url: 'https://example.com/itn',
  name_first: 'John',
  name_last: 'Doe',
  email_address: 'john@example.com',
  m_payment_id: 'VY-12345',
  amount: '100.00',
  item_name: 'Test Product',
};

const signature = generateSignatureDefinedOrder(params, '');
params.signature = signature;

const postData = Object.keys(params).map(key => `${key}=${phpUrlEncode(params[key])}`).join('&');

const options = {
  hostname: 'sandbox.payfast.co.za',
  port: 443,
  path: '/eng/process',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log("SUCCESS! Redirected to: " + res.headers.location);
    } else {
      console.log("Full Body:\n", body);
    }
  });
});
req.write(postData);
req.end();
