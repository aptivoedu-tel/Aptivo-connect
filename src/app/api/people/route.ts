import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Link from '@/lib/models/Link';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const role = searchParams.get('role'); // 'student' | 'professional' | 'all'
    const field = searchParams.get('field');
    const userEmail = searchParams.get('email');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    // Resolve current viewer ID
    let currentUid: string | null = userId;
    if (!currentUid && userEmail) {
      const viewer = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (viewer) currentUid = viewer._id.toString();
    }

    const query: Record<string, unknown> = {
      role: { $in: ['student', 'professional'] },
      'privacy.isPublic': { $ne: false },
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
    if (currentUid) {
      query._id = { $ne: currentUid };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('_id fullName name email role avatarUrl profilePhoto university campus degree fieldOfStudy field jobTitle organization bio skills interests privacy createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch link relationships for viewer if logged in
    let linkMap: Record<string, { state: string; linkId: string }> = {};
    if (currentUid && users.length > 0) {
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
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
