/**
 * One-shot admin bootstrap script.
 * Run with: node --env-file=.env.local scripts/bootstrap-admin.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'admin@connect.aptivo';
const ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'ChangeThisNow2026!';

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set.');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('✅  Connected to MongoDB');

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

const existing = await User.findOne({ email: ADMIN_EMAIL });

if (existing) {
  existing.passwordHash = hash;
  existing.password = hash;
  existing.role = 'admin';
  existing.fullName = 'Aptivo Admin';
  existing.name = 'Aptivo Admin';
  await existing.save();
  console.log('✅  Admin account updated. Email:', ADMIN_EMAIL);
} else {
  await User.create({
    fullName: 'Aptivo Admin',
    name: 'Aptivo Admin',
    email: ADMIN_EMAIL,
    password: hash,
    passwordHash: hash,
    role: 'admin',
    accountType: 'professional',
    status: 'professional',
    organization: 'Aptivo Connect HQ',
    jobTitle: 'Platform & Operations Lead',
  });
  console.log('✅  Admin account created. Email:', ADMIN_EMAIL);
}

console.log('🔑  Password set to:', ADMIN_PASSWORD);
await mongoose.disconnect();
