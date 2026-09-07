import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import Experience from '@/lib/models/Experience';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Find by ObjectId or email
    const user = await User.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { email: id.toLowerCase() }],
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch verified project showcases and experiences
    const [projects, experiences] = await Promise.all([
      Project.find({
        $or: [{ ownerId: user._id }, { 'members.userId': user._id.toString() }],
        status: { $in: ['Approved', 'Active', 'Showcase'] },
      }),
      Experience.find({
        'enrolledStudents.studentId': user._id,
        'enrolledStudents.status': { $in: ['Confirmed', 'Attended'] },
      }),
    ]);

    // Format public view respecting privacy settings
    const publicProfile = {
      _id: user._id,
      fullName: user.fullName || user.name,
      avatarUrl: user.profilePhoto || user.avatarUrl,
      accountType: user.accountType || user.role,
      role: user.role,
      university: user.university,
      degree: user.degree,
      fieldOfStudy: user.fieldOfStudy || user.field,
      currentYear: user.currentYear,
      graduationYear: user.graduationYear || user.expectedGraduation,
      organization: user.organization,
      jobTitle: user.jobTitle || user.professionalRole,
      industry: user.industry,
      city: user.city,
      bio: user.bio,
      skills: user.skills || [],
      interests: user.interests || [],
      github: user.github || user.githubUrl,
      linkedin: user.linkedin || user.linkedinUrl,
      portfolio: user.portfolio || user.portfolioUrl,
      otherLinks: user.otherLinks || [],
      email: user.privacy?.showEmail ? user.email : undefined,
      phone: user.privacy?.showPhone ? user.phone : undefined,
      whatsapp: user.privacy?.showPhone ? user.whatsapp : undefined,
      projectsCount: projects.length,
      experiencesCount: experiences.length,
      verifiedProjects: projects.map((p) => ({
        _id: p._id,
        title: p.title,
        field: p.field,
        problem: p.problem,
        building: p.building,
        isAptivoVerified: p.isAptivoVerified,
        status: p.status,
      })),
      verifiedExperiences: experiences.map((e) => ({
        _id: e._id,
        title: e.title,
        company: e.company,
        category: e.category,
        date: e.date,
      })),
    };

    return NextResponse.json({ profile: publicProfile });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
