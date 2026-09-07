import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICohortStudent {
  studentId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  university?: string;
  joinedAt: Date;
}

export interface ICohortSession extends Document {
  title: string;
  field: string;
  mentorName: string;
  mentorRole: string;
  mentorOrganization?: string;
  mentorAvatar?: string;
  date: string;
  time: string;
  meetingLink: string;
  durationMinutes: number;
  maxCapacity: number;
  students: ICohortStudent[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CohortSessionSchema: Schema<ICohortSession> = new Schema(
  {
    title: { type: String, required: true },
    field: { type: String, required: true, index: true },
    mentorName: { type: String, required: true },
    mentorRole: { type: String, required: true },
    mentorOrganization: { type: String },
    mentorAvatar: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    meetingLink: { type: String, required: true },
    durationMinutes: { type: Number, default: 45 },
    maxCapacity: { type: Number, default: 20 },
    students: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        email: { type: String },
        university: { type: String },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const CohortSession: Model<ICohortSession> =
  mongoose.models.CohortSession ||
  mongoose.model<ICohortSession>('CohortSession', CohortSessionSchema);

export default CohortSession;
