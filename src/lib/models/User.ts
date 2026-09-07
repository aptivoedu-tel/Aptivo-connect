import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserPrivacy {
  isPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

export interface IUser extends Document {
  fullName: string;
  name: string; // alias for backwards compatibility
  email: string;
  password?: string;
  passwordHash?: string;
  accountType: 'student' | 'professional';
  role: 'student' | 'professional' | 'admin';
  status: 'student' | 'professional';
  phone?: string;
  whatsapp?: string;
  city?: string;
  profilePhoto?: string;
  avatarUrl?: string; // alias for backwards compatibility

  // Student specific fields
  university?: string;
  campus?: string;
  degree?: string;
  fieldOfStudy?: string;
  field?: string;
  currentYear?: string;
  graduationYear?: string;
  expectedGraduation?: string;

  // Professional specific fields
  organization?: string;
  jobTitle?: string;
  professionalRole?: string;
  industry?: string;
  experienceYears?: string;

  // Profile details
  bio?: string;
  skills: string[];
  interests: string[];
  linkedin?: string;
  linkedinUrl?: string;
  github?: string;
  githubUrl?: string;
  portfolio?: string;
  portfolioUrl?: string;
  otherLinks?: string[];

  // Privacy controls
  privacy: IUserPrivacy;

  // Tracked Activity counts
  meetingsCount: number;
  projectsCount: number;
  experiencesCount: number;
  accessCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String },
    passwordHash: { type: String },
    accountType: {
      type: String,
      enum: ['student', 'professional'],
      default: 'student',
    },
    role: {
      type: String,
      enum: ['student', 'professional', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['student', 'professional'],
      default: 'student',
    },
    phone: { type: String },
    whatsapp: { type: String },
    city: { type: String },
    profilePhoto: { type: String },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },

    // Student fields
    university: { type: String },
    campus: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    field: { type: String },
    currentYear: { type: String },
    graduationYear: { type: String },
    expectedGraduation: { type: String },

    // Professional fields
    organization: { type: String },
    jobTitle: { type: String },
    professionalRole: { type: String },
    industry: { type: String },
    experienceYears: { type: String },

    // Profile details
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    linkedin: { type: String },
    linkedinUrl: { type: String },
    github: { type: String },
    githubUrl: { type: String },
    portfolio: { type: String },
    portfolioUrl: { type: String },
    otherLinks: { type: [String], default: [] },

    // Privacy
    privacy: {
      isPublic: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },

    // Activity stats
    meetingsCount: { type: Number, default: 0 },
    projectsCount: { type: Number, default: 0 },
    experiencesCount: { type: Number, default: 0 },
    accessCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Sync aliases before saving
UserSchema.pre<IUser>('save', function (next) {
  if (!this.fullName && this.name) this.fullName = this.name;
  if (!this.name && this.fullName) this.name = this.fullName;

  if (this.linkedin && !this.linkedinUrl) this.linkedinUrl = this.linkedin;
  if (this.linkedinUrl && !this.linkedin) this.linkedin = this.linkedinUrl;

  if (this.github && !this.githubUrl) this.githubUrl = this.github;
  if (this.githubUrl && !this.github) this.github = this.githubUrl;

  if (this.portfolio && !this.portfolioUrl) this.portfolioUrl = this.portfolio;
  if (this.portfolioUrl && !this.portfolio) this.portfolio = this.portfolioUrl;

  if (this.profilePhoto && !this.avatarUrl) this.avatarUrl = this.profilePhoto;
  if (this.avatarUrl && !this.profilePhoto) this.profilePhoto = this.avatarUrl;

  if (this.fieldOfStudy && !this.field) this.field = this.fieldOfStudy;
  if (this.field && !this.fieldOfStudy) this.fieldOfStudy = this.field;

  if (this.graduationYear && !this.expectedGraduation) this.expectedGraduation = this.graduationYear;
  if (this.expectedGraduation && !this.graduationYear) this.graduationYear = this.expectedGraduation;

  if (this.jobTitle && !this.professionalRole) this.professionalRole = this.jobTitle;
  if (this.professionalRole && !this.jobTitle) this.jobTitle = this.professionalRole;

  if (this.accountType) this.status = this.accountType;

  next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
