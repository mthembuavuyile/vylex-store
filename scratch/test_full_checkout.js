const crypto = require('crypto');
const https = require('https');

function pfUrlEncode(str) {
  return encodeURIComponent(str.trim())
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
    .replace(/%20/g, '+');
}

const PAYFAST_ORDERED_KEYS = [
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
  'cycles',
];

function generatePayfastSignature(params, passphrase) {
  let paramString = '';
  
  // Follow official PayFast documentation parameter order
  for (const key of PAYFAST_ORDERED_KEYS) {
    const val = params[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      paramString += `${key}=${pfUrlEncode(String(val))}&`;
    }
  }

  // Any additional params not in ordered list (if any)
  for (const key of Object.keys(params)) {
    if (!PAYFAST_ORDERED_KEYS.includes(key) && key !== 'signature') {
      const val = params[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        paramString += `${key}=${pfUrlEncode(String(val))}&`;
      }
    }
  }

  paramString = paramString.slice(0, -1);

  if (passphrase && passphrase.trim() !== '') {
    paramString += `&passphrase=${pfUrlEncode(passphrase)}`;
  }

  return crypto.createHash('md5').update(paramString).digest('hex');
}

// Test realistic order payload
const payload = {
  merchant_id: '22972809',
  merchant_key: 'p9ahdpi1eppwj',
  return_url: 'https://store.vylex.co.za/checkout/success?order_id=VY-M7XYZ-9912',
  cancel_url: 'https://store.vylex.co.za/checkout/cancel?order_id=VY-M7XYZ-9912',
  notify_url: 'https://store.vylex.co.za/api/payfast/itn',
  name_first: 'Sipho',
  name_last: 'Nkosi',
  email_address: 'sipho@example.co.za',
  cell_number: '0831234567',
  m_payment_id: 'VY-M7XYZ-9912',
  amount: '1299.00',
  item_name: 'Vylex Store Order VY-M7XYZ-9912',
};

const passphrase = 'Bitcoinsha256';
const signature = generatePayfastSignature(payload, passphrase);
payload.signature = signature;

const orderedKeysInPayload = PAYFAST_ORDERED_KEYS.filter(k => payload[k] !== undefined);
orderedKeysInPayload.push('signature');

const postBody = orderedKeysInPayload.map(k => `${k}=${pfUrlEncode(payload[k])}`).join('&');

const options = {
  hostname: 'www.payfast.co.za',
  port: 443,
  path: '/eng/process',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Content-Length': Buffer.byteLength(postBody)
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log("SUCCESS! Payfast Accepted Checkout! Location:", res.headers.location);
    } else {
      console.log("Error status:", res.statusCode, body.substring(0, 500));
    }
  });
});
req.write(postBody);
req.end();
