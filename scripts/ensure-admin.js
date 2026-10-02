const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let uri = process.env.MONGODB_URI;
if (!uri && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/);
    if (match) {
      uri = match[1].trim();
      break;
    }
  }
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas successfully!');

    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

    const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'ChangeThisNow2026!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const adminEmail = 'admin@connect.aptivo';
    let admin = await User.findOne({
      $or: [{ email: adminEmail }, { email: 'admin.@connect.aptivo' }]
    });

    if (admin) {
      admin.role = 'admin';
      admin.passwordHash = passwordHash;
      admin.password = passwordHash;
      admin.fullName = admin.fullName || 'Aptivo Admin Operations';
      admin.name = admin.name || 'Aptivo Admin Operations';
      admin.accountType = 'admin';
      await admin.save();
      console.log('Admin account updated with role = "admin" and verified password');
    } else {
      await User.create({
        fullName: 'Aptivo Admin Operations',
        name: 'Aptivo Admin Operations',
        email: adminEmail,
        password: passwordHash,
        passwordHash: passwordHash,
        role: 'admin',
        accountType: 'admin',
        status: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin account created with role = "admin"');
    }

    const verified = await User.findOne({ email: adminEmail });
    console.log('Verified admin in DB:', {
      _id: verified._id,
      email: verified.email,
      role: verified.role,
      fullName: verified.fullName
    });

    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
  } catch (err) {
    console.error('Error ensuring admin:', err.message);
  }
}

run();
