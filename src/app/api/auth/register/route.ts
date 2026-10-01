import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { error: 'Database is currently unreachable. Please verify your internet connection or MongoDB Atlas IP whitelist.' },
        { status: 503 }
      );
    }
    const body = await req.json();

    const {
      fullName,
      name,
      email,
      password,
      confirmPassword,
      accountType = 'student',
      phone,
      whatsapp,
      city,
      // Student
      university,
      degree,
      fieldOfStudy,
      currentYear,
      graduationYear,
      // Professional
      organization,
      jobTitle,
      industry,
      experienceYears,
      // Skills & Interests
      skills = [],
      interests = [],
      // Links
      linkedin,
      github,
      portfolio,
      profilePhoto,
    } = body;

    const chosenName = (fullName || name || '').trim();
    if (!chosenName) {
      return NextResponse.json({ error: 'Full Name is required.' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // Role validation: No Ambassador option allowed at registration!
    if (accountType !== 'student' && accountType !== 'professional') {
      return NextResponse.json(
        { error: 'Invalid account type. Only Student and Professional accounts can register.' },
        { status: 400 }
      );
    }

    // Student specific validations
    if (accountType === 'student') {
      if (!university) {
        return NextResponse.json({ error: 'University / Institute is required.' }, { status: 400 });
      }
      if (!degree && !fieldOfStudy) {
        return NextResponse.json({ error: 'Degree and Field of study are required.' }, { status: 400 });
      }
    }

    // Professional specific validations
    if (accountType === 'professional') {
      if (!organization) {
        return NextResponse.json({ error: 'Organization / Company is required.' }, { status: 400 });
      }
      if (!jobTitle) {
        return NextResponse.json({ error: 'Job Title / Role is required.' }, { status: 400 });
      }
    }

    // Check duplicate email
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Securely hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: chosenName,
      name: chosenName,
      email: cleanEmail,
      password: passwordHash, // stored hashed
      passwordHash,
      accountType,
      role: accountType,
      status: accountType,
      phone: phone || '',
      whatsapp: whatsapp || phone || '',
      city: city || 'Karachi',
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      avatarUrl: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',

      // Student fields
      university: university || '',
      degree: degree || '',
      fieldOfStudy: fieldOfStudy || degree || '',
      field: fieldOfStudy || degree || '',
      currentYear: currentYear || '1st Year',
      graduationYear: graduationYear || '2027',
      expectedGraduation: graduationYear || '2027',

      // Professional fields
      organization: organization || '',
      jobTitle: jobTitle || '',
      professionalRole: jobTitle || '',
      industry: industry || '',
      experienceYears: experienceYears || '1-3 years',

      // Skills & Interests
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],

      // Links
      linkedin: linkedin || '',
      linkedinUrl: linkedin || '',
      github: github || '',
      githubUrl: github || '',
      portfolio: portfolio || '',
      portfolioUrl: portfolio || '',

      privacy: {
        isPublic: true,
        showEmail: false,
        showPhone: false,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Proceed to onboarding.',
        redirectTo: `/onboarding?email=${encodeURIComponent(newUser.email)}`,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          name: newUser.fullName,
          email: newUser.email,
          accountType: newUser.accountType,
          role: newUser.role,
          status: newUser.status,
          university: newUser.university,
          degree: newUser.degree,
          organization: newUser.organization,
          jobTitle: newUser.jobTitle,
          avatarUrl: newUser.profilePhoto || newUser.avatarUrl,
        },
      },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE, createSessionToken(newUser), sessionCookieOptions);
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('SESSION_SECRET')) return NextResponse.json({ error: 'Registration is temporarily unavailable because secure sessions are not configured.' }, { status: 503 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
