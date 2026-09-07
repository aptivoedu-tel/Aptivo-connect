import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectApplication extends Document {
  projectId: mongoose.Types.ObjectId;
  projectTitle: string;
  applicantId: mongoose.Types.ObjectId;
  applicantName: string;
  applicantEmail: string;
  applicantUniversity?: string;
  applicantAvatar?: string;
  whyJoin: string;
  contribution: string;
  skills: string[];
  portfolioUrl?: string;
  availability: string;
  status: 'Applied' | 'Under Review' | 'Accepted' | 'Declined';
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    message: string;
    sentAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectApplicationSchema: Schema<IProjectApplication> = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    projectTitle: { type: String, required: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantUniversity: { type: String },
    applicantAvatar: { type: String },
    whyJoin: { type: String, required: true },
    contribution: { type: String, required: true },
    skills: { type: [String], default: [] },
    portfolioUrl: { type: String },
    availability: { type: String, default: '10-15 hrs/week' },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Accepted', 'Declined'],
      default: 'Applied',
      index: true,
    },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        senderName: { type: String },
        message: { type: String },
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const ProjectApplication: Model<IProjectApplication> =
  mongoose.models.ProjectApplication ||
  mongoose.model<IProjectApplication>('ProjectApplication', ProjectApplicationSchema);

export default ProjectApplication;
