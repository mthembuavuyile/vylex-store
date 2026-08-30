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

function generateSignature(params, passphrase) {
  const sortedKeys = Object.keys(params).sort();
  let paramString = '';
  sortedKeys.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      paramString += `${key}=${phpUrlEncode(val)}&`;
    }
  });
  
  let signatureString = paramString.slice(0, -1);
  if (passphrase) {
    signatureString += `&passphrase=${phpUrlEncode(passphrase)}`;
  }
  console.log('Signature String:', signatureString);
  const hash = crypto.createHash('md5').update(signatureString).digest('hex');
  console.log('MD5 Hash:', hash);
  return hash;
}

// Test with live credentials from .env.local
const params = {
  merchant_id: '22972809',
  merchant_key: 'p9ahdpi1eppwj',
  return_url: 'https://store.vylex.co.za/checkout/success?order_id=VY-TEST',
  cancel_url: 'https://store.vylex.co.za/checkout/cancel?order_id=VY-TEST',
  notify_url: 'https://store.vylex.co.za/api/payfast/itn',
  name_first: 'John',
  name_last: 'Doe',
  email_address: 'john@example.com',
  m_payment_id: 'VY-TEST123',
  amount: '100.00',
  item_name: 'Test Product',
};

const passphrase = 'Bitcoinsha256';
const signature = generateSignature(params, passphrase);
params.signature = signature;

const sortedPostKeys = Object.keys(params).sort();
const postData = sortedPostKeys.map(key => `${key}=${phpUrlEncode(params[key])}`).join('&');

const options = {
  hostname: 'www.payfast.co.za',
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
      console.log("Response Body:", body);
    }
  });
});
req.write(postData);
req.end();
