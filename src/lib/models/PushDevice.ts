import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPushDevice extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  platform: 'ios' | 'android';
  installationId: string;
  enabled: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PushDeviceSchema = new Schema<IPushDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, trim: true },
    platform: { type: String, enum: ['ios', 'android'], required: true },
    installationId: { type: String, required: true, index: true },
    enabled: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PushDeviceSchema.index({ userId: 1, installationId: 1 }, { unique: true });

const PushDevice: Model<IPushDevice> =
  mongoose.models.PushDevice || mongoose.model<IPushDevice>('PushDevice', PushDeviceSchema);

export default PushDevice;
