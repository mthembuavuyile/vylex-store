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

function testPayfast(name, params, passphrase, useDefinedOrder) {
  return new Promise((resolve) => {
    let signatureString = '';
    const keys = useDefinedOrder 
      ? payfastDefinedOrder.filter(k => params[k] !== undefined && params[k] !== '')
      : Object.keys(params).sort();

    keys.forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        signatureString += `${key}=${phpUrlEncode(val)}&`;
      }
    });

    signatureString = signatureString.slice(0, -1);
    if (passphrase) {
      signatureString += `&passphrase=${phpUrlEncode(passphrase)}`;
    }

    const signature = crypto.createHash('md5').update(signatureString).digest('hex');
    const postParams = { ...params, signature };
    
    const postKeys = useDefinedOrder 
      ? [...keys, 'signature']
      : Object.keys(postParams).sort();

    const postData = postKeys.map(k => `${k}=${phpUrlEncode(postParams[k])}`).join('&');

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
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          console.log(`[PASS] ${name} -> SUCCESS! Redirect: ${res.headers.location}`);
          resolve(true);
        } else {
          const match = body.match(/<div class="error-block__message">([\s\S]*?)<\/div>/) ||
                        body.match(/<span class="err-msg">([\s\S]*?)<\/span>/);
          const errorMsg = match ? match[1].replace(/<[^>]+>/g, '').trim() : `Status ${res.statusCode}`;
          console.log(`[FAIL] ${name} -> ${errorMsg}`);
          resolve(false);
        }
      });
    });
    req.on('error', (e) => {
      console.log(`[ERROR] ${name} -> ${e.message}`);
      resolve(false);
    });
    req.write(postData);
    req.end();
  });
}

async function runAll() {
  const baseParams = {
    merchant_id: '22972809',
    merchant_key: 'p9ahdpi1eppwj',
    return_url: 'https://store.vylex.co.za/checkout/success',
    cancel_url: 'https://store.vylex.co.za/checkout/cancel',
    notify_url: 'https://store.vylex.co.za/api/payfast/itn',
    name_first: 'John',
    name_last: 'Doe',
    email_address: 'john@example.com',
    m_payment_id: 'VY-1001',
    amount: '100.00',
    item_name: 'CartMate Order VY-1001',
  };

  console.log('--- TESTING VARIATIONS ---');
  // 1. With passphrase 'Bitcoinsha256', sorted
  await testPayfast('1. Passphrase "Bitcoinsha256", Sorted order', baseParams, 'Bitcoinsha256', false);
  // 2. With passphrase 'Bitcoinsha256', defined order
  await testPayfast('2. Passphrase "Bitcoinsha256", Defined order', baseParams, 'Bitcoinsha256', true);
  // 3. Without passphrase (empty), sorted
  await testPayfast('3. No passphrase (""), Sorted order', baseParams, '', false);
  // 4. Without passphrase (empty), defined order
  await testPayfast('4. No passphrase (""), Defined order', baseParams, '', true);
  // 5. Without passphrase and without signature param sent
  // 6. Common default passphrases?
  await testPayfast('5. Passphrase "payfast", Sorted order', baseParams, 'payfast', false);
  await testPayfast('6. Passphrase "payfast", Defined order', baseParams, 'payfast', true);
}

runAll();
