import crypto from 'crypto';

export const PAYFAST_ORDERED_KEYS = [
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
] as const;

/**
 * PayFast requires PHP urlencode equivalent encoding:
 * - Alphanumerics, '-', '_', '.' are untouched.
 * - Spaces are converted to '+'
 * - All other characters are %XX with uppercase hex.
 */
export function payfastUrlEncode(str: string): string {
  return encodeURIComponent(str.trim())
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
    .replace(/%20/g, '+');
}

/**
 * Generates an MD5 signature according to PayFast's official parameter order specification.
 */
export function generatePayfastSignature(
  params: Record<string, string>,
  passphrase?: string
): string {
  let paramString = '';

  // 1. Process known keys in PayFast's strict documented order
  for (const key of PAYFAST_ORDERED_KEYS) {
    const val = params[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      paramString += `${key}=${payfastUrlEncode(String(val))}&`;
    }
  }

  // 2. Process any other custom keys (excluding signature)
  for (const key of Object.keys(params)) {
    if (!(PAYFAST_ORDERED_KEYS as readonly string[]).includes(key) && key !== 'signature') {
      const val = params[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        paramString += `${key}=${payfastUrlEncode(String(val))}&`;
      }
    }
  }

  // 3. Remove trailing ampersand
  paramString = paramString.slice(0, -1);

  // 4. Append passphrase if present
  if (passphrase && passphrase.trim() !== '') {
    paramString += `&passphrase=${payfastUrlEncode(passphrase)}`;
  }

  // 5. MD5 hash in lowercase hex
  return crypto.createHash('md5').update(paramString).digest('hex');
}

/**
 * Creates an ordered payload object ready for HTML form POST or API submission.
 */
export function buildPayfastPayload(
  params: Record<string, string>,
  passphrase?: string
): Record<string, string> {
  const cleanParams: Record<string, string> = {};

  for (const key of PAYFAST_ORDERED_KEYS) {
    const val = params[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      cleanParams[key] = String(val).trim();
    }
  }

  for (const key of Object.keys(params)) {
    if (!(PAYFAST_ORDERED_KEYS as readonly string[]).includes(key) && key !== 'signature') {
      const val = params[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        cleanParams[key] = String(val).trim();
      }
    }
  }

  const signature = generatePayfastSignature(cleanParams, passphrase);
  cleanParams['signature'] = signature;

  return cleanParams;
}

/**
 * Verifies an ITN signature received from PayFast.
 */
export function verifyPayfastItnSignature(
  rawParams: Record<string, string>,
  receivedSignature: string,
  passphrase?: string
): boolean {
  // Option A: Check using documented parameter order
  const calculatedDefined = generatePayfastSignature(rawParams, passphrase);
  if (calculatedDefined.toLowerCase() === receivedSignature.toLowerCase()) {
    return true;
  }

  // Option B: Check using received key order
  let receivedOrderString = '';
  for (const [key, val] of Object.entries(rawParams)) {
    if (key !== 'signature' && val !== undefined && val !== null && String(val).trim() !== '') {
      receivedOrderString += `${key}=${payfastUrlEncode(String(val))}&`;
    }
  }
  receivedOrderString = receivedOrderString.slice(0, -1);
  if (passphrase && passphrase.trim() !== '') {
    receivedOrderString += `&passphrase=${payfastUrlEncode(passphrase)}`;
  }
  const calculatedReceived = crypto.createHash('md5').update(receivedOrderString).digest('hex');
  if (calculatedReceived.toLowerCase() === receivedSignature.toLowerCase()) {
    return true;
  }

  // Option C: Check alphabetical order (used by certain PayFast integrations)
  const sortedKeys = Object.keys(rawParams).filter((k) => k !== 'signature').sort();
  let sortedString = '';
  for (const key of sortedKeys) {
    const val = rawParams[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      sortedString += `${key}=${payfastUrlEncode(String(val))}&`;
    }
  }
  sortedString = sortedString.slice(0, -1);
  if (passphrase && passphrase.trim() !== '') {
    sortedString += `&passphrase=${payfastUrlEncode(passphrase)}`;
  }
  const calculatedSorted = crypto.createHash('md5').update(sortedString).digest('hex');
  return calculatedSorted.toLowerCase() === receivedSignature.toLowerCase();
}
