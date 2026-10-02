import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const conn = await connectToDatabase();
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const providedPassword = password || '';

    // Authentication cannot be safely performed while the user store is unavailable.
    if (!conn) {
      return NextResponse.json(
        { error: 'Database connection unavailable. Please check your internet connection or MongoDB Atlas IP whitelist.' },
        { status: 503 }
      );
    }

    // Look for user in MongoDB by email
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. No account found with this email.' },
        { status: 401 }
      );
    }

    const storedPassword = user.passwordHash || user.password;

    if (!storedPassword) {
      return NextResponse.json(
        { error: 'Account credentials are not configured. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify using bcrypt only — no plaintext fallback
    let isValid = false;
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      isValid = await bcrypt.compare(providedPassword, storedPassword);
      console.log('[LOGIN DEBUG] bcrypt.compare result:', isValid);
    } else {
      // Legacy plaintext — reject and instruct reset
      return NextResponse.json(
        { error: 'Your account password is stored insecurely. Please contact an admin to reset it.' },
        { status: 401 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials.' },
        { status: 401 }
      );
    }

    // Role-based redirection
    let redirectTo = '/dashboard';
    if (user.role === 'admin') {
      redirectTo = '/admin';
    }

    const response = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        _id: user._id,
        fullName: user.fullName || user.name,
        name: user.fullName || user.name,
        email: user.email,
        accountType: user.accountType || user.role,
        role: user.role,
        status: user.status,
        university: user.university,
        degree: user.degree,
        organization: user.organization,
        jobTitle: user.jobTitle,
        avatarUrl: user.profilePhoto || user.avatarUrl,
      },
    });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('SESSION_SECRET')) return NextResponse.json({ error: 'Login is temporarily unavailable because secure sessions are not configured.' }, { status: 503 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
