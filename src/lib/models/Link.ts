import mongoose, { Schema, Document, Model } from 'mongoose';

export type LinkStatus = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface ILink extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: LinkStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema: Schema<ILink> = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'canceled'],
      default: 'pending',
      index: true,
    },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Compound index to quickly find link relationship between two users
LinkSchema.index({ requester: 1, recipient: 1 });

const Link: Model<ILink> = mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);

export default Link;
