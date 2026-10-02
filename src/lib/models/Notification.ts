import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'meetup' | 'meet' | 'build' | 'experience' | 'access' | 'system';
  link?: string;
  conversationId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['meetup', 'meet', 'build', 'experience', 'access', 'link', 'system'],
      default: 'system',
    },
    link: { type: String },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
