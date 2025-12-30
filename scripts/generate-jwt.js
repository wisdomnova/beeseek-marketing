#!/usr/bin/env node

const crypto = require('crypto');

// JWT generation function
function generateJWT(payload, secret, expiresIn = '7d') {
  // Convert expiration to seconds
  let expirationSeconds = 7 * 24 * 60 * 60; // default 7 days
  if (expiresIn === '1d') expirationSeconds = 24 * 60 * 60;
  if (expiresIn === '1h') expirationSeconds = 60 * 60;
  
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const claims = {
    ...payload,
    iat: now,
    exp: now + expirationSeconds
  };

  // Base64url encode
  const encodeBase64Url = (str) => {
    return Buffer.from(JSON.stringify(str))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const headerEncoded = encodeBase64Url(header);
  const payloadEncoded = encodeBase64Url(claims);
  const message = `${headerEncoded}.${payloadEncoded}`;

  // Create signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${message}.${signature}`;
}

// Parse command line arguments
const args = process.argv.slice(2);
const secret = process.env.JWT_SECRET || 'beeseek-marketing-jwt-secret-key-2025';

if (args.length === 0) {
  console.log('JWT Generator\n');
  console.log('Usage: node scripts/generate-jwt.js <type> [name] [id]\n');
  console.log('Examples:');
  console.log('  node scripts/generate-jwt.js manager tosin 1');
  console.log('  node scripts/generate-jwt.js manager jimi 2');
  console.log('  node scripts/generate-jwt.js admin admin 1\n');
  console.log('Secret: ' + secret);
  process.exit(0);
}

const type = args[0];
const name = args[1] || type;
const id = args[2] || '1';

let payload = {
  name: name,
  id: id
};

if (type === 'admin') {
  payload.role = 'admin';
}

const token = generateJWT(payload, secret);

console.log('\n' + '='.repeat(80));
console.log('Generated JWT Token:');
console.log('='.repeat(80));
console.log(token);
console.log('='.repeat(80));
console.log('\nPayload:');
console.log(JSON.stringify(payload, null, 2));
console.log('\nExpires in: 7 days');
console.log('Algorithm: HS256');
console.log('\nTo use in requests, add this header:');
console.log(`Authorization: Bearer ${token}`);
console.log('\nOr set cookie (for browser):');
console.log(`${type === 'admin' ? 'admin-token' : 'auth-token'}=${token}`);
console.log('='.repeat(80) + '\n');
