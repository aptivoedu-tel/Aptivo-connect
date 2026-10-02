import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeetup extends Document {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string;
  speakerName: string;
  speakerRole?: string;
  speakerOrganization?: string;
  speakerBio?: string;
  format: 'online' | 'in-person' | 'hybrid';
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  platform?: string;
  onlineLink?: string;
  capacity: number;
  registrationDeadline?: string;
  eligibility?: string;
  status: 'draft' | 'published' | 'registration-closed' | 'completed' | 'cancelled' | 'hidden';
  registrations: Array<{ studentId: mongoose.Types.ObjectId; studentName: string; studentEmail: string; answers?: Record<string, string>; registeredAt: Date; attendance: 'registered' | 'attended' | 'absent' }>;
}

const MeetupSchema = new Schema<IMeetup>({
  title: { type: String, required: true, trim: true }, shortDescription: { type: String, required: true }, description: { type: String, required: true },
  category: { type: String, default: 'Community session' }, tags: { type: [String], default: [] }, coverImage: String,
  speakerName: { type: String, required: true }, speakerRole: String, speakerOrganization: String, speakerBio: String,
  format: { type: String, enum: ['online', 'in-person', 'hybrid'], required: true }, date: { type: String, required: true }, startTime: { type: String, required: true }, endTime: { type: String, required: true }, timezone: { type: String, default: 'Asia/Karachi' },
  venueName: String, venueAddress: String, venueCity: String, platform: String, onlineLink: String,
  capacity: { type: Number, required: true, min: 1 }, registrationDeadline: String, eligibility: String,
  status: { type: String, enum: ['draft', 'published', 'registration-closed', 'completed', 'cancelled', 'hidden'], default: 'draft', index: true },
  registrations: [{ studentId: { type: Schema.Types.ObjectId, ref: 'User' }, studentName: String, studentEmail: String, answers: Schema.Types.Mixed, registeredAt: { type: Date, default: Date.now }, attendance: { type: String, enum: ['registered', 'attended', 'absent'], default: 'registered' } }],
}, { timestamps: true });

export default (mongoose.models.Meetup as Model<IMeetup>) || mongoose.model<IMeetup>('Meetup', MeetupSchema);
