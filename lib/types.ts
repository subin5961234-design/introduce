export interface StarExperience {
  id: string;
  title: string;
  category?: string;
  createdAt?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  keywords?: string[];
}

export interface QuestionDefinition {
  id: string;
  question: string;
  targetLength: number;
  isCustom?: boolean;
}

export type QuestionItem = QuestionDefinition;

export interface BatchGenerationRequest {
  company: string;
  role: string;
  companyInfo?: string;
  jobDescription?: string;
  tone: 'professional' | 'passionate' | 'collaborative';
  subheadingStyle: 'impact_number' | 'job_core' | 'storytelling';
  keywords: string[];
  questions: QuestionDefinition[];
  experiences: StarExperience[];
  // Backwards compatibility
  items?: any[];
}

export type GenerationRequest = BatchGenerationRequest;

export interface GeneratedQuestionResult {
  id: string;
  question: string;
  matchedExperienceTitle?: string;
  matchReason?: string;
  title: string;
  content: string;
  targetLength: number;
  charCount: number;
  charCountNoSpaces: number;
  keyHighlights: string[];
  feedback: string;
}

export interface GenerationResponse {
  items: GeneratedQuestionResult[];
  overallFeedback?: string;
  // For backwards compatibility
  title?: string;
  content?: string;
  keyHighlights?: string[];
  feedback?: string;
}

export interface RewriteRequest {
  company: string;
  role: string;
  question?: string;
  title: string;
  content: string;
  action: 'shorten' | 'expand' | 'more_professional' | 'new_subheadings' | 'custom';
  customInstruction?: string;
  targetLength: number;
}
