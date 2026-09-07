import { IUser } from './models/User';

export interface ProfileCompletionResult {
  score: number;
  suggestions: string[];
  isComplete: boolean;
}

export function calculateProfileCompletion(user: Partial<IUser>): ProfileCompletionResult {
  let score = 0;
  const suggestions: string[] = [];

  // Basic Info
  if (user.fullName || user.name) {
    score += 10;
  } else {
    suggestions.push('Add your full name');
  }

  if (user.email) {
    score += 10;
  }

  if (user.phone && user.whatsapp) {
    score += 10;
  } else {
    suggestions.push('Add your Phone & WhatsApp number for session reminders');
  }

  if (user.city) {
    score += 5;
  } else {
    suggestions.push('Add your city');
  }

  // Academic / Professional
  const isStudent = user.accountType !== 'professional' && user.role !== 'professional';
  if (isStudent) {
    if (user.university && (user.degree || user.fieldOfStudy || user.field)) {
      score += 20;
    } else {
      suggestions.push('Add your University and Degree / Field of study');
    }
  } else {
    if (user.organization && (user.jobTitle || user.professionalRole)) {
      score += 20;
    } else {
      suggestions.push('Add your current Organization and Job Title');
    }
  }

  // Bio / About
  if (user.bio && user.bio.trim().length >= 20) {
    score += 15;
  } else {
    suggestions.push('Write a short bio (at least 20 characters) describing what you build or research');
  }

  // Skills
  if (user.skills && user.skills.length >= 3) {
    score += 15;
  } else {
    suggestions.push(`Add at least 3 skill tags (currently ${user.skills?.length || 0})`);
  }

  // Interests
  if (user.interests && user.interests.length >= 2) {
    score += 10;
  } else {
    suggestions.push('Select at least 2 domain interests');
  }

  // Portfolio Links
  if (user.github || user.githubUrl || user.linkedin || user.linkedinUrl || user.portfolio || user.portfolioUrl) {
    score += 5;
  } else {
    suggestions.push('Add your GitHub, LinkedIn, or Portfolio link');
  }

  const boundedScore = Math.min(100, Math.max(0, score));

  return {
    score: boundedScore,
    suggestions,
    isComplete: boundedScore >= 80,
  };
}
