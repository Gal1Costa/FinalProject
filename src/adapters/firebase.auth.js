/* eslint-disable no-unused-vars */
/**
 * Firebase Authentication Adapter (stub version)
 * TODO: Integrate firebase-admin in future.
 */
async function verifyIdToken(idToken) {
  if (!idToken) return null;
  // TODO: Use firebase-admin.auth().verifyIdToken(idToken)
  return null;
}
module.exports = { verifyIdToken };
