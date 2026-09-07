export type UserRole = 'FRESHER' | 'STARTUP' | 'ADMIN';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type JobVisibility = 'PUBLIC' | 'PRIVATE';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface Education {
  degree: string;
  university: string;
  fieldOfStudy?: string;
  graduationYear: number;
  grade?: string;
}

export interface Certification {
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface Project {
  title: string;
  description?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface FresherProfile {
  _id: string;
  user: string | User;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  location?: string;
  education?: Education[];
  skills: string[];
  certifications?: Certification[];
  projects?: Project[];
  experience?: Experience[];
  careerInterests?: string[];
  preferredJobRoles?: string[];
  preferredLocations?: string[];
  workMode?: WorkMode;
  portfolioUrl?: string;
  gitHubUrl?: string;
  linkedInUrl?: string;
  resumeUrl?: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  user: string | User;
  companyName: string;
  logo?: string;
  description?: string;
  aboutCompany?: string;
  industry: string;
  location: string;
  website?: string;
  companySize?: string;
  foundedYear?: number;
  technologies?: string[];
  isPublic?: boolean;
  followersCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  company: Company | string;
  postedBy: string;
  title: string;
  description: string;
  responsibilities?: string[];
  qualifications?: string[];
  requiredSkills: string[];
  preferredSkills?: string[];
  education?: {
    degree?: string;
    field?: string;
  };
  experience?: {
    minYears?: number;
    maxYears?: number;
  };
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    isNegotiable?: boolean;
  };
  deadline?: string;
  status: JobStatus;
  visibility: JobVisibility;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  job: Job;
  company: Company;
  fresher: User;
  fresherProfile?: FresherProfile;
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  statusHistory?: Array<{
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }>;
  matchScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AtsPipelineData {
  pipeline: Record<ApplicationStatus, Application[]>;
  totalApplicants: number;
  stageCounts: Record<ApplicationStatus, number>;
}


export interface MatchAnalysis {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
  explanation: string;
  breakdown?: {
    requiredSkillsScore: number;
    preferredSkillsScore: number;
    experienceScore: number;
    educationScore: number;
    careerInterestsScore: number;
  };
  job?: Job;
  candidate?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    location?: string;
    completionPercentage?: number;
    resumeUrl?: string;
    skills?: string[];
  };
}

export interface AssessmentQuestion {
  _id: string;
  questionText: string;
  points?: number;
  options: Array<{
    _id: string;
    text: string;
  }>;
}

export interface Assessment {
  _id: string;
  title: string;
  description?: string;
  category: string;
  skillName: string;
  durationMinutes: number;
  passingScorePercentage: number;
  questions: AssessmentQuestion[];
  isActive?: boolean;
}

export interface AssessmentResult {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  passingScorePercentage: number;
  evaluatedAnswers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
}

export interface SkillGapAnalysis {
  targetRole: string;
  readinessScore: number;
  possessedSkills: string[];
  missingSkills: string[];
  totalRequiredCount: number;
  recommendationSummary: string;
}

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
  targetSkills: string[];
  estimatedWeeks: number;
  recommendedResources: Array<{
    title: string;
    type: 'COURSE' | 'PROJECT' | 'BOOK' | 'DOCUMENTATION' | 'CERTIFICATION';
    url: string;
  }>;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CareerRoadmap {
  _id: string;
  targetRole: string;
  currentReadinessScore: number;
  possessedSkills: string[];
  missingSkills: string[];
  roadmap: RoadmapStep[];
  summary: string;
}

export interface Invitation {
  _id: string;
  company: Company;
  fresher: User;
  job: Job;
  message?: string;
  status: InvitationStatus;
  expiryDate: string;
  createdAt: string;
}

export interface Interview {
  _id: string;
  application: Application | string;
  fresher: User;
  company: Company;
  date: string;
  time: string;
  durationMinutes: number;
  meetingLink: string;
  interviewType: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  sender?: {
    name: string;
    avatar?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
  details?: any;
}
