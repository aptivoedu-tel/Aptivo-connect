/**
 * Verify & fix admin account.
 * Run: node --env-file=.env.local scripts/verify-admin.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'admin@connect.aptivo';
const ADMIN_PASSWORD = 'ChangeThisNow2026!';

await mongoose.connect(MONGODB_URI);
console.log('✅  Connected to MongoDB');

// Use flexible schema (strict: false) to bypass enum restrictions
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models?.UserFlex || mongoose.model('UserFlex', UserSchema, 'users');

const admin = await User.findOne({ email: ADMIN_EMAIL });

if (!admin) {
  console.log('❌  Admin not found — creating fresh...');
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
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
    skills: [],
    interests: [],
  });
  console.log('✅  Admin created.');
} else {
  console.log('Found admin:', {
    _id: admin._id,
    email: admin.email,
    role: admin.role,
    hasPasswordHash: !!(admin.passwordHash),
    hasPassword: !!(admin.password),
    hashPrefix: (admin.passwordHash || admin.password || '').substring(0, 7),
  });

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  // Force-update using updateOne to bypass Mongoose validation
  const result = await User.updateOne(
    { email: ADMIN_EMAIL },
    { $set: { passwordHash: hash, password: hash, role: 'admin' } }
  );
  console.log('✅  Password force-updated:', result);

  // Verify the hash works
  const updated = await User.findOne({ email: ADMIN_EMAIL });
  const valid = await bcrypt.compare(ADMIN_PASSWORD, updated.passwordHash || updated.password);
  console.log('🔑  Password verification test:', valid ? 'PASS ✅' : 'FAIL ❌');
}

await mongoose.disconnect();
console.log('Done.');
