import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import Experience from '@/lib/models/Experience';
import MeetRequest from '@/lib/models/MeetRequest';
import ProfileRecord from '@/lib/models/ProfileRecord';
import { calculateProfileCompletion } from '@/lib/profileUtils';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const externalLinkDomains: Record<string, string[]> = { linkedin: ['linkedin.com'], github: ['github.com'], youtube: ['youtube.com', 'youtu.be'] };
function validExternalLinks(value: unknown) {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item.url !== 'string' || typeof item.type !== 'string') return false;
    try { const url = new URL(item.url); return ['http:', 'https:'].includes(url.protocol) && (!externalLinkDomains[item.type] || externalLinkDomains[item.type].some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))); } catch { return false; }
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('id') || searchParams.get('userId');
    await connectToDatabase();

    let user: any;
    let isOwnProfile = false;
    const sessionUser = await requireUser().catch(() => null);

    if (targetId) {
      // Fetch requested Profile Owner by ObjectId or email
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetId);
      user = await User.findOne({
        $or: [
          ...(isObjectId ? [{ _id: targetId }] : []),
          { email: targetId.toLowerCase() },
        ],
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (sessionUser && sessionUser._id.toString() === user._id.toString()) {
        isOwnProfile = true;
      }

      if (!isOwnProfile && user.privacy?.isPublic === false) {
        return NextResponse.json({ error: 'This profile is private.' }, { status: 403 });
      }
    } else {
      // Fetch authenticated user's own profile
      if (!sessionUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = sessionUser;
      isOwnProfile = true;
    }

    const completion = calculateProfileCompletion(user.toObject());

    // Fetch user's verified platform activity (strictly scoped to target user's ID)
    const [userProjects, userMeets, userExperiences, userRecords] = await Promise.all([
      Project.find({
        $or: [{ ownerId: user._id }, { 'members.userId': user._id.toString() }],
      }),
      MeetRequest.find({ studentId: user._id }),
      Experience.find({ 'enrolledStudents.studentId': user._id }),
      ProfileRecord.find({ userId: user._id, ...(isOwnProfile ? {} : { visibility: 'public' }) }).sort({ endDate: -1, createdAt: -1 }),
    ]);

    return NextResponse.json({
      user,
      completion,
      isOwnProfile,
      activity: {
        projects: userProjects,
        meets: userMeets,
        experiences: userExperiences,
        records: userRecords,
      },
    });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await requireUser();
    await connectToDatabase();
    const body = await req.json();
    const { email: _ignoredEmail, ...updates } = body;
    const user = currentUser;

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
    if (updates.coverImage !== undefined) user.coverImage = updates.coverImage;

    // Student fields
    if (updates.university !== undefined) user.university = updates.university;
    if (updates.campus !== undefined) user.campus = updates.campus;
    if (updates.campusId !== undefined) user.campusId = updates.campusId || undefined;
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
    if (updates.headline !== undefined) user.headline = String(updates.headline).slice(0, 160);
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
    if (updates.externalLinks !== undefined) {
      if (!validExternalLinks(updates.externalLinks)) return NextResponse.json({ error: 'External links must be valid HTTP/HTTPS URLs and match their selected platform.' }, { status: 400 });
      user.externalLinks = updates.externalLinks.map((link: { type: string; label?: string; url: string }) => ({ type: link.type, label: String(link.label || '').slice(0, 80), url: link.url }));
    }

    // Privacy
    if (updates.privacy) {
      user.privacy = {
        isPublic: updates.privacy.isPublic ?? user.privacy?.isPublic ?? true,
        showEmail: updates.privacy.showEmail ?? user.privacy?.showEmail ?? false,
        showPhone: updates.privacy.showPhone ?? user.privacy?.showPhone ?? false,
        appearInDiscovery: updates.privacy.appearInDiscovery ?? user.privacy?.appearInDiscovery ?? true,
        appearInCampus: updates.privacy.appearInCampus ?? user.privacy?.appearInCampus ?? true,
        allowConnectionRequests: updates.privacy.allowConnectionRequests ?? user.privacy?.allowConnectionRequests ?? true,
        openToQuestions: updates.privacy.openToQuestions ?? user.privacy?.openToQuestions ?? false,
        questionTopics: Array.isArray(updates.privacy.questionTopics) ? updates.privacy.questionTopics.slice(0, 8) : user.privacy?.questionTopics ?? [],
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
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
