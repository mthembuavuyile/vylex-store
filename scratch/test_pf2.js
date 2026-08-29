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
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

const params = {
  merchant_id: '10000100',
  merchant_key: '46f0cd694581a',
  name_first: 'John',
  name_last: 'Customer',
  email_address: 'john@example.com',
  m_payment_id: 'VY-12345',
  amount: '1099.00',
  item_name: 'CartMate Order VY-12345',
};

const passphrase = '';
const signature = generateSignature(params, passphrase);
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
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (body.includes('Unfortunately we could not process your transaction')) {
      console.log("Error 400 HTML found in body.");
    } else if (res.statusCode === 302 || res.statusCode === 301) {
      console.log("Redirected! Success.");
    } else {
      console.log("Body snippet:", body.slice(0, 500));
    }
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
