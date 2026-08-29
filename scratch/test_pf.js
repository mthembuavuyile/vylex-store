const crypto = require('crypto');
const https = require('https');

function phpUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

function generateSignaturePHP(params, passphrase) {
  const sortedKeys = Object.keys(params).sort();
  let paramString = '';
  sortedKeys.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      paramString += `${key}=${phpUrlEncode(val.trim())}&`;
    }
  });
  let signatureString = paramString.slice(0, -1);
  if (passphrase) {
    signatureString += `&passphrase=${phpUrlEncode(passphrase.trim())}`;
  }
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

const params = {
  merchant_id: '10000100',
  merchant_key: '46f0cd694581a',
  return_url: 'http://localhost:3000/checkout/success?order_id=VY-XYZ',
  cancel_url: 'http://localhost:3000/checkout/cancel?order_id=VY-XYZ',
  notify_url: 'http://localhost:3000/api/payfast/itn',
  name_first: 'John',
  name_last: 'Customer',
  email_address: 'john@example.com',
  cell_number: '0821234567',
  m_payment_id: 'VY-XYZ',
  amount: '1099.00',
  item_name: 'CartMate Order VY-XYZ',
};

const passphrase = '';

const signature = generateSignaturePHP(params, passphrase);
params.signature = signature;

const sortedPostKeys = Object.keys(params).sort();
const postData = sortedPostKeys.map(key => `${key}=${phpUrlEncode(params[key])}`).join('&');

const options = {
  hostname: 'sandbox.payfast.co.za',
  port: 443,
  path: '/eng/process',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    if (res.statusCode === 302 || res.statusCode === 301) {
       console.log("Redirected to:", res.headers.location);
    } else {
       console.log("Response body length:", body.length);
       console.log("Response body:", body);
       if (body.includes('Unfortunately we could not process your transaction')) {
          console.log("Error 400 HTML found in body.");
       }
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
