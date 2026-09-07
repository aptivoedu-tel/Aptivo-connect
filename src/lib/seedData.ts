import connectToDatabase from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const conn = await connectToDatabase();
  if (!conn) {
    return { success: false, message: 'Database connection not available.' };
  }

  // Ensure Admin exists with credentials (admin@connect.aptivo / aptivo.co)
  let admin = await User.findOne({
    $or: [{ email: 'admin@connect.aptivo' }, { email: 'admin.@connect.aptivo' }],
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('aptivo.co', salt);

  if (!admin) {
    admin = await User.create({
      fullName: 'Aptivo Admin Operations',
      name: 'Aptivo Admin Operations',
      email: 'admin@connect.aptivo',
      password: hashedPassword,
      passwordHash: hashedPassword,
      phone: '+92 321 9876543',
      whatsapp: '+92 321 9876543',
      role: 'admin',
      accountType: 'professional',
      status: 'professional',
      organization: 'Aptivo Connect HQ',
      jobTitle: 'Platform & Operations Lead',
      professionalRole: 'Platform & Operations Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      bio: 'Managing Aptivo Connect operations, mentor matching, and campus bridges.',
      skills: ['Operations', 'Community', 'Matching', 'Mentorship'],
      interests: ['Education', 'Tech Ecosystem', 'Student Success'],
    });
  } else {
    admin.role = 'admin';
    admin.passwordHash = hashedPassword;
    admin.password = hashedPassword;
    await admin.save();
  }

  return { success: true, message: 'Admin account verified.' };
}
