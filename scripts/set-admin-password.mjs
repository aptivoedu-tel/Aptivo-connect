/**
 * One-shot: set admin password to exactly what's provided, no re-hashing loops.
 * Run: node --env-file=.env.local scripts/set-admin-password.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'admin@connect.aptivo';
const NEW_PASSWORD = 'ChangeThisNow2026!';

await mongoose.connect(MONGODB_URI);

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models?.UAP || mongoose.model('UAP', UserSchema, 'users');

// Hash ONCE
const hash = await bcrypt.hash(NEW_PASSWORD, 10);
console.log('New hash:', hash.substring(0, 20) + '...');

// Verify hash before writing
const preCheck = await bcrypt.compare(NEW_PASSWORD, hash);
console.log('Pre-write verification:', preCheck ? 'PASS ✅' : 'FAIL ❌');
if (!preCheck) { console.error('Hash generation failed!'); process.exit(1); }

// Write to DB
const result = await User.updateOne(
  { email: ADMIN_EMAIL },
  { $set: { passwordHash: hash, password: hash, role: 'admin' } }
);
console.log('DB write:', result.modifiedCount === 1 ? 'SUCCESS ✅' : 'No document modified ⚠️');

// Read back and verify
const admin = await User.findOne({ email: ADMIN_EMAIL });
const readBack = await bcrypt.compare(NEW_PASSWORD, admin.passwordHash);
console.log('Read-back verification:', readBack ? 'PASS ✅' : 'FAIL ❌');

console.log('\n✅ Admin credentials:');
console.log('   Email   :', ADMIN_EMAIL);
console.log('   Password:', NEW_PASSWORD);

await mongoose.disconnect();
