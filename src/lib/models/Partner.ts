import mongoose, { Schema, Document, Model } from 'mongoose';

// Partner is an INTERNAL Aptivo CRM record.
// Partners do NOT have Aptivo Connect accounts.
// Partners are external orgs managed entirely by the Aptivo team.

export interface IPartner extends Document {
  organizationName: string;
  type: 'Company' | 'University' | 'Research Lab' | 'Tech Community' | 'Platform Partner' | 'Startup' | 'Professional';
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  contactWhatsApp?: string;
  city: string;
  country: string;
  websiteUrl?: string;
  logoUrl?: string;
  description: string;
  whatTheyProvide: string; // e.g. "Workplace visits for 20 students, 2x/year"
  pillarsSupported: Array<'MEET' | 'BUILD' | 'EXPERIENCE' | 'ACCESS'>;
  partnershipStatus: 'Active' | 'Prospecting' | 'On Hold' | 'Inactive';
  lastContactDate?: string;
  internalNotes?: string;
  opportunitiesProvidedCount: number;
  studentsReachedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema: Schema<IPartner> = new Schema(
  {
    organizationName: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['Company', 'University', 'Research Lab', 'Tech Community', 'Platform Partner', 'Startup', 'Professional'],
      required: true,
    },
    contactPerson: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    contactWhatsApp: { type: String },
    city: { type: String, default: 'Karachi' },
    country: { type: String, default: 'Pakistan' },
    websiteUrl: { type: String },
    logoUrl: { type: String },
    description: { type: String, required: true },
    whatTheyProvide: { type: String, required: true },
    pillarsSupported: {
      type: [String],
      enum: ['MEET', 'BUILD', 'EXPERIENCE', 'ACCESS'],
      default: ['EXPERIENCE'],
    },
    partnershipStatus: {
      type: String,
      enum: ['Active', 'Prospecting', 'On Hold', 'Inactive'],
      default: 'Active',
      index: true,
    },
    lastContactDate: { type: String },
    internalNotes: { type: String },
    opportunitiesProvidedCount: { type: Number, default: 0 },
    studentsReachedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Partner: Model<IPartner> =
  mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);

export default Partner;
