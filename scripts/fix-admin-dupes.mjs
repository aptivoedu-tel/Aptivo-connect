import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
await mongoose.connect(MONGODB_URI);

const db = mongoose.connection.db;
const usersCollection = db.collection('users');

// 1. Delete duplicate admin.@connect.aptivo
const deleteResult = await usersCollection.deleteMany({ email: 'admin.@connect.aptivo' });
console.log('Deleted duplicate admin records:', deleteResult.deletedCount);

// 2. Set exact password for admin@connect.aptivo
const password = 'ChangeThisNow2026!';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

const updateResult = await usersCollection.updateOne(
  { email: 'admin@connect.aptivo' },
  {
    $set: {
      passwordHash: hash,
      password: hash,
      role: 'admin',
      fullName: 'Aptivo Admin Operations',
      name: 'Aptivo Admin Operations'
    }
  },
  { upsert: true }
);

console.log('Admin password update result:', updateResult.modifiedCount || updateResult.upsertedCount);

// 3. Verify single admin user in database
const admins = await usersCollection.find({ email: /admin/i }).toArray();
console.log('Remaining admin users count:', admins.length);

for (const a of admins) {
  const match = await bcrypt.compare(password, a.passwordHash);
  console.log(`User ${a.email} password verify for '${password}':`, match ? 'PASS ✅' : 'FAIL ❌');
}

await mongoose.disconnect();
