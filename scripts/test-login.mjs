/**
 * Simulate the exact login route flow.
 * Run: node --env-file=.env.local scripts/test-login.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const TEST_EMAIL = 'admin@connect.aptivo';
const TEST_PASSWORD = 'ChangeThisNow2026!';

await mongoose.connect(MONGODB_URI);

// Use exact same schema as User model
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models?.UserTest || mongoose.model('UserTest', UserSchema, 'users');

const cleanEmail = TEST_EMAIL.trim().toLowerCase();
const user = await User.findOne({
  $or: [{ email: cleanEmail }, { email: cleanEmail.replace('@', '.@') }],
});

if (!user) { console.log('❌ User not found'); process.exit(1); }

console.log('--- passwordHash field ---');
console.log('  present:', !!user.passwordHash);
console.log('  prefix:', user.passwordHash?.substring(0, 7) || 'none');

console.log('--- password field ---');
console.log('  present:', !!user.password);
console.log('  prefix:', user.password?.substring(0, 7) || 'none');

const storedPassword = user.passwordHash || user.password;
console.log('\nstoredPassword resolves to:', user.passwordHash ? 'passwordHash' : 'password');
console.log('hash prefix:', storedPassword?.substring(0, 7));

const isBcrypt = storedPassword?.startsWith('$2a$') || storedPassword?.startsWith('$2b$');

if (isBcrypt) {
  const isValid = await bcrypt.compare(TEST_PASSWORD, storedPassword);
  console.log('bcrypt.compare (passwordHash||password):', isValid ? 'PASS ✅' : 'FAIL ❌');

  if (user.passwordHash) {
    const r = await bcrypt.compare(TEST_PASSWORD, user.passwordHash);
    console.log('bcrypt.compare (passwordHash direct):', r ? 'PASS ✅' : 'FAIL ❌');
  }
  if (user.password) {
    const r = await bcrypt.compare(TEST_PASSWORD, user.password);
    console.log('bcrypt.compare (password direct):', r ? 'PASS ✅' : 'FAIL ❌');
  }
}

await mongoose.disconnect();
