import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Link from '@/lib/models/Link';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const viewer = await requireUser(); await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const role = searchParams.get('role'); // 'student' | 'professional' | 'all'
    const field = searchParams.get('field');
    const university = searchParams.get('university');
    const campus = searchParams.get('campus');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    // Resolve current viewer ID
    const currentUid = viewer._id.toString();

    const query: Record<string, unknown> = {
      role: { $in: ['student', 'professional'] },
      'privacy.isPublic': { $ne: false }, 'privacy.appearInDiscovery': { $ne: false },
    };

    if (role && role !== 'all') {
      query.role = role;
    }

    if (field && field !== 'all') {
      query.$or = [
        { fieldOfStudy: new RegExp(field, 'i') },
        { field: new RegExp(field, 'i') },
        { industry: new RegExp(field, 'i') },
      ];
    }
    if (university) query.university = new RegExp(`^${university.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (campus) query.campus = new RegExp(`^${campus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { fullName: regex },
        { name: regex },
        { skills: regex },
        { university: regex },
        { organization: regex },
        { jobTitle: regex },
        { degree: regex },
        { fieldOfStudy: regex },
        { bio: regex },
      ];
    }

    // Exclude viewer from list
    query._id = { $ne: currentUid };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('_id fullName name email role avatarUrl profilePhoto university campus degree fieldOfStudy field jobTitle organization bio skills interests privacy createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch link relationships for viewer if logged in
    let linkMap: Record<string, { state: string; linkId: string }> = {};
    if (users.length > 0) {
      const userIds = users.map((u) => u._id);
      const links = await Link.find({
        $or: [
          { requester: currentUid, recipient: { $in: userIds } },
          { requester: { $in: userIds }, recipient: currentUid },
        ],
      });

      links.forEach((l) => {
        const isRequester = l.requester.toString() === currentUid;
        const otherId = isRequester ? l.recipient.toString() : l.requester.toString();
        let state = 'none';
        if (l.status === 'accepted') {
          state = 'accepted';
        } else if (l.status === 'pending') {
          state = isRequester ? 'pending_outgoing' : 'pending_incoming';
        } else {
          state = l.status;
        }
        linkMap[otherId] = { state, linkId: l._id.toString() };
      });
    }

    const annotatedUsers = users.map((u) => {
      const uObj = u.toObject();
      const linkInfo = linkMap[u._id.toString()] || { state: 'none', linkId: null };
      return {
        ...uObj,
        connectionState: linkInfo.state,
        linkId: linkInfo.linkId,
      };
    });

    return NextResponse.json({
      users: annotatedUsers,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
