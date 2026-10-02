import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  name: string;
  role: string;
  avatarUrl?: string;
  university?: string;
}

export interface IMilestone {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  weekNumber: number;
}

export interface IProject extends Document {
  title: string;
  problem: string;
  building: string;
  description: string;
  field: string;
  requiredSkills: string[];
  teamSize: number;
  duration: string;
  mode: 'Remote' | 'In-person' | 'Hybrid';
  location?: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  ownerAvatar?: string;
  ownerUniversity?: string;
  members: IProjectMember[];
  milestones: IMilestone[];
  status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Showcase' | 'Hidden' | 'Archived';
  isAptivoVerified: boolean;
  coverImage?: string;
  showcase?: {
    demoUrl?: string;
    githubUrl?: string;
    videoUrl?: string;
    images?: string[];
    outcomes?: string;
    publishedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    title: { type: String, required: true },
    problem: { type: String, required: true },
    building: { type: String, required: true },
    description: { type: String, required: true },
    field: { type: String, required: true, index: true },
    requiredSkills: { type: [String], default: [] },
    teamSize: { type: Number, default: 4 },
    duration: { type: String, default: '6 weeks' },
    mode: { type: String, enum: ['Remote', 'In-person', 'Hybrid'], default: 'Remote' },
    location: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true },
    ownerAvatar: { type: String },
    ownerUniversity: { type: String },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        role: { type: String },
        avatarUrl: { type: String },
        university: { type: String },
      },
    ],
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
        weekNumber: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Active', 'Completed', 'Showcase', 'Hidden', 'Archived'],
      default: 'Pending',
      index: true,
    },
    isAptivoVerified: { type: Boolean, default: false },
    coverImage: { type: String },
    showcase: {
      demoUrl: { type: String },
      githubUrl: { type: String },
      videoUrl: { type: String },
      images: { type: [String], default: [] },
      outcomes: { type: String },
      publishedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
