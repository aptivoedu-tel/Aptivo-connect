import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
await mongoose.connect(MONGODB_URI);

const users = await mongoose.connection.db.collection('users').find({
  $or: [{ role: 'admin' }, { email: /admin/i }]
}).toArray();

console.log('--- ADMIN USERS FOUND IN DB ---');
console.log(users.map(u => ({
  _id: u._id,
  email: u.email,
  role: u.role,
  passwordHash: u.passwordHash,
  password: u.password,
})));

await mongoose.disconnect();
