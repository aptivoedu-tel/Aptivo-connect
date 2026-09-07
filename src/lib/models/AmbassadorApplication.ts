import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAmbassadorApplication extends Document {
  userId: mongoose.Types.ObjectId;
  // Snapshot fields at time of application
  fullName: string;
  email: string;
  university: string;
  degree: string;
  field: string;
  city: string;
  // Application-specific fields
  whyAmbassador: string;
  campusOrCommunity: string;
  leadershipExperience: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  whatsapp: string;
  availability: string;
  // Lifecycle
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected';
  adminNotes?: string;
  // Post-acceptance
  responsibilities?: string;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AmbassadorApplicationSchema: Schema<IAmbassadorApplication> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    university: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    city: { type: String, required: true },
    whyAmbassador: { type: String, required: true },
    campusOrCommunity: { type: String, required: true },
    leadershipExperience: { type: String, required: true },
    linkedinUrl: { type: String },
    twitterUrl: { type: String },
    instagramUrl: { type: String },
    whatsapp: { type: String, required: true },
    availability: { type: String, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'],
      default: 'Submitted',
      index: true,
    },
    adminNotes: { type: String },
    responsibilities: { type: String },
    joinedAt: { type: Date },
  },
  { timestamps: true }
);

const AmbassadorApplication: Model<IAmbassadorApplication> =
  mongoose.models.AmbassadorApplication ||
  mongoose.model<IAmbassadorApplication>('AmbassadorApplication', AmbassadorApplicationSchema);

export default AmbassadorApplication;
