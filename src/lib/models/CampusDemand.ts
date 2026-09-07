import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampusDemand extends Document {
  ambassadorId: mongoose.Types.ObjectId;
  ambassadorName: string;
  campus: string;
  university: string;
  category: 'MEET' | 'BUILD' | 'EXPERIENCE' | 'ACCESS';
  title: string;
  studentCountEstimate: number;
  description: string;
  status: 'Reported' | 'Reviewing' | 'Action Scheduled' | 'Resolved';
  actionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampusDemandSchema: Schema<ICampusDemand> = new Schema(
  {
    ambassadorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ambassadorName: { type: String, required: true },
    campus: { type: String, required: true, index: true },
    university: { type: String, required: true },
    category: {
      type: String,
      enum: ['MEET', 'BUILD', 'EXPERIENCE', 'ACCESS'],
      required: true,
    },
    title: { type: String, required: true },
    studentCountEstimate: { type: Number, default: 10 },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Reported', 'Reviewing', 'Action Scheduled', 'Resolved'],
      default: 'Reported',
      index: true,
    },
    actionNotes: { type: String },
  },
  { timestamps: true }
);

const CampusDemand: Model<ICampusDemand> =
  mongoose.models.CampusDemand ||
  mongoose.model<ICampusDemand>('CampusDemand', CampusDemandSchema);

export default CampusDemand;
