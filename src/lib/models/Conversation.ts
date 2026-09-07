import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  lastSenderId?: mongoose.Types.ObjectId;
  unreadCount?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    lastSenderId: { type: Schema.Types.ObjectId, ref: 'User' },
    unreadCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

// Compound index on participants
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
