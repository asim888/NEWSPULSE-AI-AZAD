
export enum Category {
  AZAD_STUDIO = 'Azad Studio',
  HYDERABAD = 'Hyderabad',
  TELANGANA = 'Telangana',
  INDIA = 'India',
  INTERNATIONAL = 'International',
  SPORTS = 'Sports',
  FOUNDERS = 'Founders'
}

export interface Article {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  imageUrl?: string;
  description: string; // The short RSS snippet
  summaryShort?: string; // AI Summary (Pre-calculated or cached)
  descriptionRomanUrdu?: string; // The short RSS snippet in Roman Urdu
  descriptionUrdu?: string; // The short RSS snippet in Urdu Script
  descriptionHindi?: string; // The short RSS snippet in Hindi
  descriptionTelugu?: string; // The short RSS snippet in Telugu
  content?: string; // The full content (fetched or AI generated)
  category: Category;
  url: string;
}

export interface EnhancedArticleContent {
  fullArticle: string;
  summaryShort: string;
  summaryRomanUrdu: string;
  summaryUrdu: string;
  summaryHindi: string;
  summaryTelugu: string;
  // Full translations
  fullArticleRomanUrdu?: string;
  fullArticleUrdu?: string;
  fullArticleHindi?: string;
  fullArticleTelugu?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface UserState {
  hasEntered: boolean;
  isPremium: boolean;
  viewedArticles: string[]; // IDs of articles viewed
}

export type SubscriptionPlan = 'free' | 'trial' | 'premium';

export interface SubscriptionStatus {
    plan: SubscriptionPlan;
    expiry: number | null; // Timestamp
    autoRenew: boolean;
}

export interface ToastMessage {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
}
