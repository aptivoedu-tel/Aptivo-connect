import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperienceQuestion {
  id: string;
  questionText: string;
  questionType: 'short-text' | 'long-text' | 'single-choice' | 'multiple-choice';
  required: boolean;
  options?: string[];
}

export interface IEnrolledStudent {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  university?: string;
  whyAttend?: string;
  questionResponses?: Array<{ questionText: string; answer: string }>;
  status: 'Applied' | 'Selected' | 'Confirmed' | 'Completed';
  enrolledAt: Date;
}

export interface IExperience extends Document {
  title: string;
  company: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  city: string;
  capacity: number;
  enrolledCount: number;
  eligibility: string;
  deadline: string;
  image: string;
  posterUrl?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Hidden';
  questionnaire: IExperienceQuestion[];
  enrolledStudents: IEnrolledStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema: Schema<IExperience> = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'Software House' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true, default: 'Karachi' },
    capacity: { type: Number, default: 20 },
    enrolledCount: { type: Number, default: 0 },
    eligibility: { type: String, default: 'Open to all enrolled university students' },
    deadline: { type: String },
    image: { type: String },
    posterUrl: { type: String },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Hidden'],
      default: 'Upcoming',
      index: true,
    },
    questionnaire: [
      {
        id: { type: String },
        questionText: { type: String, required: true },
        questionType: {
          type: String,
          enum: ['short-text', 'long-text', 'single-choice', 'multiple-choice'],
          default: 'short-text',
        },
        required: { type: Boolean, default: true },
        options: { type: [String], default: [] },
      },
    ],
    enrolledStudents: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User' },
        studentName: { type: String },
        studentEmail: { type: String },
        university: { type: String },
        whyAttend: { type: String },
        questionResponses: [
          {
            questionText: { type: String },
            answer: { type: String },
          },
        ],
        status: {
          type: String,
          enum: ['Applied', 'Selected', 'Confirmed', 'Completed'],
          default: 'Applied',
        },
        enrolledAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Experience: Model<IExperience> =
  mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);

export default Experience;
