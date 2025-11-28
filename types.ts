export type ViewState = 'HOME' | 'SOS' | 'GUIDE' | 'HEALING' | 'LESSONS' | 'QUIZ' | 'PLAN' | 'TIMER';

export interface QuizAnswers {
  painLevel: number; // 1-10
  painType: string; // 'Ardência', 'Pontada', 'Dor no bico', 'Dor na mama toda'
  nippleCondition: string; // 'Normal', 'Vermelho', 'Rachado/Fissura', 'Sangrando'
  emotion: string; // 'Triste', 'Ansiosa', 'Cansada', 'Com medo'
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
}

export interface GuideStep {
  title: string;
  description: string;
  imageUrl?: string;
}