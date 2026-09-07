import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccessEvent extends Document {
  title: string;
  category: 'Webinar' | 'Meetup' | 'Seminar' | 'Platform Access' | 'Resource' | 'Partner Perk';
  description: string;
  date: string;
  time: string;
  format: 'Online' | 'In-person' | 'Hybrid';
  linkOrVenue: string;
  partnerName: string;
  perks?: string[];
  image?: string;
  status: 'Upcoming' | 'Completed';
  registrations: Array<{
    studentId: mongoose.Types.ObjectId;
    studentName: string;
    studentEmail: string;
    registeredAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AccessEventSchema: Schema<IAccessEvent> = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Webinar', 'Meetup', 'Seminar', 'Platform Access', 'Resource', 'Partner Perk'],
      default: 'Meetup',
      index: true,
    },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    format: { type: String, enum: ['Online', 'In-person', 'Hybrid'], default: 'Online' },
    linkOrVenue: { type: String, required: true },
    partnerName: { type: String, default: 'Aptivo Connect' },
    perks: { type: [String], default: [] },
    image: { type: String },
    status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming', index: true },
    registrations: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User' },
        studentName: { type: String },
        studentEmail: { type: String },
        registeredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const AccessEvent: Model<IAccessEvent> =
  mongoose.models.AccessEvent || mongoose.model<IAccessEvent>('AccessEvent', AccessEventSchema);

export default AccessEvent;
