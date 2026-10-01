import connectToDatabase from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';

/**
 * Idempotent admin bootstrap.
 * Creates or re-locks the Aptivo Admin account.
 *
 * Required environment variable:
 *   ADMIN_BOOTSTRAP_PASSWORD — the desired admin password (min 12 chars).
 *   Set this in .env.local (never commit it).
 *
 * Called by:
 *   POST /api/seed          (admin-authenticated, manual trigger)
 *   POST /api/admin/clean-dummy-data  (admin-authenticated, resets state)
 */
export async function seedDatabase() {
  const conn = await connectToDatabase();
  if (!conn) {
    return { success: false, message: 'Database connection not available.' };
  }

  const rawPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!rawPassword || rawPassword.length < 8) {
    return {
      success: false,
      message:
        'ADMIN_BOOTSTRAP_PASSWORD is not configured or is too short (min 8 chars). ' +
        'Set it in .env.local and restart the server.',
    };
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  let admin = await User.findOne({
    $or: [{ email: 'admin@connect.aptivo' }, { role: 'admin' }],
  });

  if (!admin) {
    admin = await User.create({
      fullName: 'Aptivo Admin Operations',
      name: 'Aptivo Admin Operations',
      email: 'admin@connect.aptivo',
      password: hashedPassword,
      passwordHash: hashedPassword,
      phone: '',
      whatsapp: '',
      role: 'admin',
      accountType: 'professional',
      status: 'professional',
      organization: 'Aptivo Connect HQ',
      jobTitle: 'Platform & Operations Lead',
      professionalRole: 'Platform & Operations Lead',
      bio: 'Managing Aptivo Connect operations, mentor matching, and campus bridges.',
      skills: ['Operations', 'Community', 'Matching', 'Mentorship'],
      interests: ['Education', 'Tech Ecosystem', 'Student Success'],
    });
    return { success: true, message: 'Admin account created.' };
  } else {
    // Re-lock: use updateOne to bypass Mongoose enum validation on `status`
    await User.updateOne(
      { _id: admin._id },
      { $set: { role: 'admin', passwordHash: hashedPassword, password: hashedPassword } }
    );
    return { success: true, message: 'Admin account verified and password updated.' };
  }
}
