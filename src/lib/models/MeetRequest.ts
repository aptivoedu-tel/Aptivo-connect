import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeetRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentUniversity?: string;
  studentAvatar?: string;
  field: string;
  targetRole?: string;
  discussionTopic: string;
  format: 'Online' | 'In-person' | 'Either';
  preference: 'Individual' | 'Small group' | 'Either';
  status: 'Submitted' | 'Finding Connection' | 'Scheduled' | 'Completed' | 'Cancelled';
  scheduledDetails?: {
    mentorName: string;
    mentorRole: string;
    mentorOrganization?: string;
    mentorAvatar?: string;
    date: string;
    time: string;
    meetingLink: string;
    durationMinutes: number;
    notes?: string;
  };
  feedback?: {
    rating: number;
    takeaway?: string;
    submittedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MeetRequestSchema: Schema<IMeetRequest> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentUniversity: { type: String },
    studentAvatar: { type: String },
    field: { type: String, required: true, index: true },
    targetRole: { type: String },
    discussionTopic: { type: String, required: true },
    format: { type: String, enum: ['Online', 'In-person', 'Either'], default: 'Online' },
    preference: { type: String, enum: ['Individual', 'Small group', 'Either'], default: 'Individual' },
    status: {
      type: String,
      enum: ['Submitted', 'Finding Connection', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Submitted',
      index: true,
    },
    scheduledDetails: {
      mentorName: { type: String },
      mentorRole: { type: String },
      mentorOrganization: { type: String },
      mentorAvatar: { type: String },
      date: { type: String },
      time: { type: String },
      meetingLink: { type: String },
      durationMinutes: { type: Number, default: 30 },
      notes: { type: String },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      takeaway: { type: String },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const MeetRequest: Model<IMeetRequest> =
  mongoose.models.MeetRequest || mongoose.model<IMeetRequest>('MeetRequest', MeetRequestSchema);

export default MeetRequest;
