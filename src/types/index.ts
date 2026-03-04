// ─── Earnings & Metrics ──────────────────────────────────────────────────────

export interface EarningsSnapshot {
  timestamp: number;
  rpm: number;        // Revenue per 1,000 views
  cpm: number;        // Cost per 1,000 impressions (advertiser-side)
  totalEarned: number;
  viewCount: number;
  engagementRate: number;  // 0–1
  adImpressions: number;
}

export interface PayoutProjection {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  confidence: number;  // 0–1
}

export interface EarningsHistory {
  date: string;
  earnings: number;
  views: number;
  rpm: number;
  cpm: number;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  change: number;      // percentage change vs prior period
  trend: 'up' | 'down' | 'neutral';
  unit: string;
}

// ─── Sponsored Content ───────────────────────────────────────────────────────

export type DealStatus = 'available' | 'pending' | 'accepted' | 'rejected' | 'completed';
export type ContentCategory = 'tech' | 'beauty' | 'gaming' | 'fitness' | 'fashion' | 'food' | 'travel' | 'finance';

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  category: ContentCategory;
  verified: boolean;
}

export interface SponsoredPost {
  id: string;
  brand: Brand;
  title: string;
  description: string;
  payout: number;           // USD
  cpmOffer: number;
  duration: number;         // seconds
  deadline: string;
  requirements: string[];
  audienceMatch: number;    // 0–1 match score
  status: DealStatus;
  estimatedReach: number;
  category: ContentCategory;
  thumbnailUrl: string;
}

// ─── Inline Ad Engine ────────────────────────────────────────────────────────

export type AdFormat = 'pre-roll' | 'mid-roll' | 'overlay' | 'banner' | 'sponsored-segment';
export type AdPlacement = 'feed' | 'video-start' | 'video-mid' | 'video-end';

export interface Ad {
  id: string;
  brand: Brand;
  format: AdFormat;
  placement: AdPlacement;
  durationSeconds: number;
  thumbnailUrl: string;
  cta: string;
  ctaUrl: string;
  estimatedRevenue: number;
  impressions: number;
  clicks: number;
  ctr: number;             // click-through rate
  completionRate: number;  // 0–1
}

export interface InjectedAd {
  ad: Ad;
  insertAfterIndex: number;  // position in feed
  variantId: string;         // which A/B variant triggered this
}

// ─── Video Feed ───────────────────────────────────────────────────────────────

export interface VideoPost {
  id: string;
  thumbnailUrl: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  earnings: number;
  duration: number;         // seconds
  postedAt: string;
  rpm: number;
  adRevenue: number;
  organicRevenue: number;
  tags: string[];
  injectedAds: Ad[];
}

// ─── A/B Testing ─────────────────────────────────────────────────────────────

export type TestStatus = 'running' | 'completed' | 'paused' | 'draft';
export type TestType = 'ad-format' | 'placement' | 'cta' | 'frequency' | 'duration';

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  impressions: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  isControl: boolean;
  isWinner: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  type: TestType;
  status: TestStatus;
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  confidenceLevel: number;   // 0–1 statistical confidence
  primaryMetric: string;
  uplift: number;            // percentage
  sampleSize: number;
}

// ─── Creator Profile ─────────────────────────────────────────────────────────

export interface AudienceDemographic {
  ageGroup: string;
  percentage: number;
  gender: 'male' | 'female' | 'other';
  topRegions: string[];
}

export interface CreatorProfile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  followerCount: number;
  totalViews: number;
  accountTier: 'starter' | 'growing' | 'pro' | 'elite';
  categories: ContentCategory[];
  demographics: AudienceDemographic[];
  monetizationEnabled: boolean;
  payoutMethod: 'bank' | 'paypal' | 'crypto';
  lifetimeEarnings: number;
}

// ─── WebSocket Events ────────────────────────────────────────────────────────

export type WSEventType =
  | 'earnings_update'
  | 'new_deal'
  | 'ad_impression'
  | 'ab_result'
  | 'payout_processing';

export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: number;
}

// ─── Dashboard State ─────────────────────────────────────────────────────────

export type DashboardTab = 'earnings' | 'marketplace' | 'feed' | 'abtests';
