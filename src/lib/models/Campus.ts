import mongoose, { Model, Schema } from 'mongoose';

export interface ICampus {
  name: string;
  shortName?: string;
  university: string;
  city?: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampusSchema = new Schema<ICampus>({
  name: { type: String, required: true, trim: true },
  shortName: { type: String, trim: true },
  university: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  description: { type: String, maxlength: 1000 },
  logoUrl: { type: String },
  active: { type: Boolean, default: true, index: true },
  visible: { type: Boolean, default: true, index: true },
}, { timestamps: true });

CampusSchema.index({ university: 1, name: 1 }, { unique: true });

export default (mongoose.models.Campus as Model<ICampus>) || mongoose.model<ICampus>('Campus', CampusSchema);
