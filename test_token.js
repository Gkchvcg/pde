import * as auth from './apps/api/src/services/auth.js';

const secret = "dev-secret-change-me";
const address = "0x123";
try {
  const token = auth.issueToken({ address }, secret);
  console.log("Token:", token);
  const payload = auth.verifyToken(token, secret);
  console.log("Payload:", payload);
  console.log("Verify bad secret:", auth.verifyToken(token, "wrong"));
  
  // Try sending an invalid token
  const badToken = "invalid.token";
  console.log("Verify bad format:", auth.verifyToken(badToken, secret));
} catch(e) {
  console.error(e);
}
