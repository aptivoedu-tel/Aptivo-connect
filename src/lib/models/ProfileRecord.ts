import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type ProfileRecordOrigin = 'SELF_ADDED' | 'APTIVO_MEET' | 'APTIVO_BUILD' | 'APTIVO_EXPERIENCE' | 'APTIVO_AMBASSADOR';
export type VerificationState = 'SELF_REPORTED' | 'APTIVO_VERIFIED' | 'ORGANIZER_VERIFIED';
export interface IProfileRecord extends Document {
  userId: mongoose.Types.ObjectId; origin: ProfileRecordOrigin; sourceEntityId?: mongoose.Types.ObjectId;
  section: 'project' | 'experience' | 'leadership' | 'achievement'; title: string; role?: string; organization?: string;
  startDate?: Date; endDate?: Date; status: 'active' | 'completed'; description?: string; skills: string[];
  artifacts: Array<{ label: string; url: string }>; verification: VerificationState; verifiedBy?: mongoose.Types.ObjectId; visibility: 'public' | 'private';
}
const schema = new Schema<IProfileRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, origin: { type: String, enum: ['SELF_ADDED', 'APTIVO_MEET', 'APTIVO_BUILD', 'APTIVO_EXPERIENCE', 'APTIVO_AMBASSADOR'], required: true }, sourceEntityId: { type: Schema.Types.ObjectId },
  section: { type: String, enum: ['project', 'experience', 'leadership', 'achievement'], required: true }, title: { type: String, required: true, maxlength: 160 }, role: { type: String, maxlength: 120 }, organization: { type: String, maxlength: 160 }, startDate: Date, endDate: Date,
  status: { type: String, enum: ['active', 'completed'], default: 'completed' }, description: { type: String, maxlength: 2000 }, skills: { type: [String], default: [] }, artifacts: [{ label: { type: String, maxlength: 100 }, url: { type: String, maxlength: 2048 } }],
  verification: { type: String, enum: ['SELF_REPORTED', 'APTIVO_VERIFIED', 'ORGANIZER_VERIFIED'], default: 'SELF_REPORTED' }, verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }, visibility: { type: String, enum: ['public', 'private'], default: 'public' },
}, { timestamps: true });
schema.index({ userId: 1, section: 1, visibility: 1 });
export default (mongoose.models.ProfileRecord as Model<IProfileRecord>) || mongoose.model<IProfileRecord>('ProfileRecord', schema);
