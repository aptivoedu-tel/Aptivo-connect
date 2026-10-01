import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MeetRequest from '@/lib/models/MeetRequest';
import User from '@/lib/models/User';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    // Group pending requests by field
    const pendingMeets = await MeetRequest.find({
      status: { $in: ['Submitted', 'Finding Connection'] },
    });

    const fieldMap: Record<
      string,
      {
        field: string;
        studentCount: number;
        sampleTopics: string[];
        studentIds: string[];
        studentNames: string[];
        suggestedProfessional: string;
        suggestedRole: string;
        duration: string;
      }
    > = {};

    // Suggest suitable verified professionals based on domain
    const mentorDefaults: Record<string, { name: string; role: string }> = {
      Engineering: { name: 'Ahmed Khan', role: 'Lead Structural Engineer, NESPAK' },
      'AI & Research': { name: 'Dr. Tariq Mahmood', role: 'AI Lab Director & Professor' },
      Technology: { name: 'Zeeshan Aftab', role: 'Head of Engineering, 10Pearls' },
      Medicine: { name: 'Dr. Ayesha Malik', role: 'Clinical AI Researcher, AKUH' },
      Business: { name: 'Aatif Awan', role: 'Founder & Managing Partner, Indus Valley Capital' },
    };

    for (const meet of pendingMeets) {
      const f = meet.field || 'Technology';
      if (!fieldMap[f]) {
        const defaultMentor = mentorDefaults[f] || {
          name: 'Industry Lead',
          role: `${f} Specialist`,
        };
        fieldMap[f] = {
          field: f,
          studentCount: 0,
          sampleTopics: [],
          studentIds: [],
          studentNames: [],
          suggestedProfessional: defaultMentor.name,
          suggestedRole: defaultMentor.role,
          duration: '45 minutes • Curated Group Session',
        };
      }

      fieldMap[f].studentCount += 1;
      fieldMap[f].studentIds.push(meet.studentId?.toString());
      fieldMap[f].studentNames.push(meet.studentName);
      if (fieldMap[f].sampleTopics.length < 3 && meet.discussionTopic) {
        fieldMap[f].sampleTopics.push(meet.discussionTopic);
      }
    }

    // Add baseline mock cohorts if database is in early demo state
    if (Object.keys(fieldMap).length === 0) {
      fieldMap['AI & Research'] = {
        field: 'AI & Research',
        studentCount: 18,
        sampleTopics: [
          'Publishing CVPR/NeurIPS conference papers as an undergraduate',
          'Deploying quantized open-weights LLMs on local edge hardware',
        ],
        studentIds: [],
        studentNames: ['Hamza Raza', 'Sara Siddiqui', 'Ali Raza', '15 other students'],
        suggestedProfessional: 'Dr. Tariq Mahmood',
        suggestedRole: 'AI Lab Director & Associate Professor',
        duration: '45 minutes • Curated Online Session',
      };

      fieldMap['Engineering'] = {
        field: 'Engineering',
        studentCount: 14,
        sampleTopics: ['BIM workflows and structural analysis in modern transport mega-projects'],
        studentIds: [],
        studentNames: ['Zainab Fatima', 'Bilal Ahmed', '12 other students'],
        suggestedProfessional: 'Ahmed Khan',
        suggestedRole: 'Lead Structural Engineer, NESPAK',
        duration: '45 minutes • Curated Online Session',
      };
    }

    const suggestions = Object.values(fieldMap);
    return NextResponse.json({ suggestions });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
