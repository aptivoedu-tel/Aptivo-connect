import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import Experience from '@/lib/models/Experience';
import MeetRequest from '@/lib/models/MeetRequest';
import { calculateProfileCompletion } from '@/lib/profileUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const completion = calculateProfileCompletion(user.toObject());

    // Fetch user's verified platform activity
    const [userProjects, userMeets, userExperiences] = await Promise.all([
      Project.find({
        $or: [{ ownerId: user._id }, { 'members.userId': user._id.toString() }],
      }),
      MeetRequest.find({ studentId: user._id }),
      Experience.find({ 'enrolledStudents.studentId': user._id }),
    ]);

    return NextResponse.json({
      user,
      completion,
      activity: {
        projects: userProjects,
        meets: userMeets,
        experiences: userExperiences,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required to update profile' }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Apply updates
    if (updates.fullName) {
      user.fullName = updates.fullName;
      user.name = updates.fullName;
    }
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.whatsapp !== undefined) user.whatsapp = updates.whatsapp;
    if (updates.city !== undefined) user.city = updates.city;
    if (updates.profilePhoto !== undefined) {
      user.profilePhoto = updates.profilePhoto;
      user.avatarUrl = updates.profilePhoto;
    }
    if (updates.avatarUrl !== undefined) {
      user.avatarUrl = updates.avatarUrl;
      user.profilePhoto = updates.avatarUrl;
    }

    // Student fields
    if (updates.university !== undefined) user.university = updates.university;
    if (updates.campus !== undefined) user.campus = updates.campus;
    if (updates.degree !== undefined) user.degree = updates.degree;
    if (updates.fieldOfStudy !== undefined) {
      user.fieldOfStudy = updates.fieldOfStudy;
      user.field = updates.fieldOfStudy;
    }
    if (updates.field !== undefined) {
      user.field = updates.field;
      user.fieldOfStudy = updates.field;
    }
    if (updates.currentYear !== undefined) user.currentYear = updates.currentYear;
    if (updates.graduationYear !== undefined) {
      user.graduationYear = updates.graduationYear;
      user.expectedGraduation = updates.graduationYear;
    }

    // Professional fields
    if (updates.organization !== undefined) user.organization = updates.organization;
    if (updates.jobTitle !== undefined) {
      user.jobTitle = updates.jobTitle;
      user.professionalRole = updates.jobTitle;
    }
    if (updates.industry !== undefined) user.industry = updates.industry;
    if (updates.experienceYears !== undefined) user.experienceYears = updates.experienceYears;

    // Profile details
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.skills !== undefined) user.skills = Array.isArray(updates.skills) ? updates.skills : [];
    if (updates.interests !== undefined) user.interests = Array.isArray(updates.interests) ? updates.interests : [];
    if (updates.linkedin !== undefined) {
      user.linkedin = updates.linkedin;
      user.linkedinUrl = updates.linkedin;
    }
    if (updates.github !== undefined) {
      user.github = updates.github;
      user.githubUrl = updates.github;
    }
    if (updates.portfolio !== undefined) {
      user.portfolio = updates.portfolio;
      user.portfolioUrl = updates.portfolio;
    }
    if (updates.otherLinks !== undefined) user.otherLinks = updates.otherLinks;

    // Privacy
    if (updates.privacy) {
      user.privacy = {
        isPublic: updates.privacy.isPublic ?? user.privacy?.isPublic ?? true,
        showEmail: updates.privacy.showEmail ?? user.privacy?.showEmail ?? false,
        showPhone: updates.privacy.showPhone ?? user.privacy?.showPhone ?? false,
      };
    }

    await user.save();

    const completion = calculateProfileCompletion(user.toObject());

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user,
      completion,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
