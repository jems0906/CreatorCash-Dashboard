import type {
  EarningsSnapshot,
  EarningsHistory,
  SponsoredPost,
  VideoPost,
  ABTest,
  CreatorProfile,
  Ad,
  Brand,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Brands ───────────────────────────────────────────────────────────────────
const BRANDS: Brand[] = [
  { id: 'b1', name: 'NovaTech', logoUrl: '', category: 'tech', verified: true },
  { id: 'b2', name: 'GlowLab', logoUrl: '', category: 'beauty', verified: true },
  { id: 'b3', name: 'PixelRig', logoUrl: '', category: 'gaming', verified: false },
  { id: 'b4', name: 'IronCore', logoUrl: '', category: 'fitness', verified: true },
  { id: 'b5', name: 'ThreadCo', logoUrl: '', category: 'fashion', verified: true },
  { id: 'b6', name: 'BiteBox', logoUrl: '', category: 'food', verified: false },
  { id: 'b7', name: 'WanderAll', logoUrl: '', category: 'travel', verified: true },
  { id: 'b8', name: 'VaultFi', logoUrl: '', category: 'finance', verified: true },
];

// ─── Live Snapshot ────────────────────────────────────────────────────────────
export function generateSnapshot(prev?: EarningsSnapshot): EarningsSnapshot {
  const base = prev ?? { rpm: 4.2, cpm: 7.8, totalEarned: 1247.5, viewCount: 285000, engagementRate: 0.067, adImpressions: 142000, timestamp: Date.now() };
  return {
    timestamp: Date.now(),
    rpm: Math.max(0.5, base.rpm + rand(-0.3, 0.4)),
    cpm: Math.max(1, base.cpm + rand(-0.5, 0.7)),
    totalEarned: base.totalEarned + rand(0.02, 0.25),
    viewCount: base.viewCount + Math.floor(rand(50, 400)),
    engagementRate: Math.min(0.3, Math.max(0.01, base.engagementRate + rand(-0.002, 0.003))),
    adImpressions: base.adImpressions + Math.floor(rand(20, 200)),
  };
}

// ─── Earnings History (30 days) ───────────────────────────────────────────────
export function generateEarningsHistory(): EarningsHistory[] {
  const history: EarningsHistory[] = [];
  let cumEarnings = 800;
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const daily = rand(18, 95);
    cumEarnings += daily;
    history.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      earnings: parseFloat(daily.toFixed(2)),
      views: Math.floor(rand(8000, 45000)),
      rpm: parseFloat(rand(2.5, 7.5).toFixed(2)),
      cpm: parseFloat(rand(4, 12).toFixed(2)),
    });
  }
  return history;
}

// ─── Sponsored Deals ─────────────────────────────────────────────────────────
const DEAL_TITLES = [
  'Unbox our new flagship headphones', 'Feature our app in your next video',
  'Wear our limited-edition collection', 'Cook our meal-kit on camera',
  'Review our crypto trading platform', '60-second game sponsorship segment',
  'Travel vlog with our booking app', 'Morning routine skincare integration',
];
const REQUIREMENTS = [
  ['Min. 30-sec mention', 'Include affiliate link in bio', 'Post within 14 days'],
  ['Dedicated segment', 'Swipe-up CTA', 'Submit draft for approval'],
  ['Organic feel, no script', 'Tag brand account', 'Story crosspost required'],
];

export function generateSponsoredDeals(): SponsoredPost[] {
  return BRANDS.map((brand, i) => ({
    id: `deal-${i}`,
    brand,
    title: DEAL_TITLES[i % DEAL_TITLES.length],
    description: `${brand.name} is looking for authentic creators in the ${brand.category} space to showcase their latest product to your highly engaged audience.`,
    payout: parseFloat(rand(200, 4500).toFixed(0)),
    cpmOffer: parseFloat(rand(8, 22).toFixed(2)),
    duration: pick([15, 30, 60, 90]),
    deadline: new Date(Date.now() + rand(3, 21) * 86400000).toLocaleDateString(),
    requirements: pick(REQUIREMENTS),
    audienceMatch: parseFloat(rand(0.55, 0.98).toFixed(2)),
    status: pick(['available', 'available', 'available', 'pending', 'accepted'] as const),
    estimatedReach: Math.floor(rand(50000, 500000)),
    category: brand.category,
    thumbnailUrl: '',
  }));
}

// ─── Inline Ads ───────────────────────────────────────────────────────────────
export function generateAds(): Ad[] {
  return BRANDS.slice(0, 5).map((brand, i) => ({
    id: `ad-${i}`,
    brand,
    format: pick(['pre-roll', 'mid-roll', 'overlay', 'sponsored-segment'] as const),
    placement: pick(['feed', 'video-start', 'video-mid'] as const),
    durationSeconds: pick([6, 15, 30]),
    thumbnailUrl: '',
    cta: pick(['Shop Now', 'Learn More', 'Download Free', 'Get 20% Off', 'Try Today']),
    ctaUrl: '#',
    estimatedRevenue: parseFloat(rand(0.8, 8.5).toFixed(2)),
    impressions: Math.floor(rand(5000, 80000)),
    clicks: Math.floor(rand(100, 3500)),
    ctr: parseFloat(rand(0.01, 0.06).toFixed(3)),
    completionRate: parseFloat(rand(0.45, 0.92).toFixed(2)),
  }));
}

// ─── Video Feed ───────────────────────────────────────────────────────────────
const VIDEO_TITLES = [
  '5 Habits That Changed My Life', 'I Tried The Viral Morning Routine 🌅',
  'Honest Review: Is It Worth It?', 'Day In My Life (NYC Edition)',
  'React to This... 😂', 'How I Made $10K From One Video',
  'Travel Vlog: Tokyo Day 1', 'The Algorithm Changed — Here\'s What I Found',
  'Behind The Scenes of My Studio', 'Watch Time Secrets Nobody Talks About',
];

export function generateVideoFeed(): VideoPost[] {
  const ads = generateAds();
  return Array.from({ length: 10 }, (_, i) => ({
    id: `vid-${i}`,
    thumbnailUrl: '',
    title: VIDEO_TITLES[i],
    views: Math.floor(rand(12000, 980000)),
    likes: Math.floor(rand(800, 45000)),
    comments: Math.floor(rand(80, 5000)),
    shares: Math.floor(rand(50, 8000)),
    earnings: parseFloat(rand(12, 650).toFixed(2)),
    duration: Math.floor(rand(45, 480)),
    postedAt: new Date(Date.now() - rand(0, 30) * 86400000).toLocaleDateString(),
    rpm: parseFloat(rand(2.5, 8).toFixed(2)),
    adRevenue: parseFloat(rand(8, 500).toFixed(2)),
    organicRevenue: parseFloat(rand(4, 150).toFixed(2)),
    tags: pick([['#fyp', '#creator'], ['#tech', '#review'], ['#lifestyle'], ['#gaming', '#stream']]),
    injectedAds: i % 3 === 0 ? [pick(ads)] : [],
  }));
}

// ─── A/B Tests ────────────────────────────────────────────────────────────────
export function generateABTests(): ABTest[] {
  return [
    {
      id: 'abt-1',
      name: 'Mid-roll vs End-roll Ad Placement',
      type: 'placement',
      status: 'running',
      startDate: '2026-02-15',
      variants: [
        { id: 'v-ctrl', name: 'End-roll (Control)', description: 'Ad plays at video end', config: { placement: 'end' }, impressions: 48200, conversions: 1350, revenue: 892, ctr: 0.028, conversionRate: 0.024, isControl: true, isWinner: false },
        { id: 'v-mid', name: 'Mid-roll (Variant)', description: 'Ad plays at 50% progress', config: { placement: 'mid' }, impressions: 47900, conversions: 1920, revenue: 1341, ctr: 0.040, conversionRate: 0.036, isControl: false, isWinner: true },
      ],
      confidenceLevel: 0.94,
      primaryMetric: 'Revenue',
      uplift: 50.3,
      sampleSize: 96100,
    },
    {
      id: 'abt-2',
      name: '15s vs 30s Sponsored Segment Duration',
      type: 'duration',
      status: 'running',
      startDate: '2026-02-22',
      variants: [
        { id: 'v-15s', name: '15-second (Control)', description: 'Short-form ad segment', config: { duration: 15 }, impressions: 22100, conversions: 910, revenue: 604, ctr: 0.041, conversionRate: 0.038, isControl: true, isWinner: false },
        { id: 'v-30s', name: '30-second (Variant)', description: 'Long-form ad segment', config: { duration: 30 }, impressions: 21900, conversions: 830, revenue: 712, ctr: 0.038, conversionRate: 0.035, isControl: false, isWinner: false },
      ],
      confidenceLevel: 0.71,
      primaryMetric: 'CTR',
      uplift: -7.3,
      sampleSize: 44000,
    },
    {
      id: 'abt-3',
      name: '"Shop Now" vs "Get 20% Off" CTA Copy',
      type: 'cta',
      status: 'completed',
      startDate: '2026-01-10',
      endDate: '2026-01-31',
      variants: [
        { id: 'v-shop', name: 'Shop Now (Control)', description: 'Generic action CTA', config: { cta: 'Shop Now' }, impressions: 105000, conversions: 3150, revenue: 4200, ctr: 0.030, conversionRate: 0.029, isControl: true, isWinner: false },
        { id: 'v-disc', name: 'Get 20% Off (Variant)', description: 'Discount-focused CTA', config: { cta: 'Get 20% Off' }, impressions: 105000, conversions: 5250, revenue: 7140, ctr: 0.050, conversionRate: 0.048, isControl: false, isWinner: true },
      ],
      confidenceLevel: 0.99,
      primaryMetric: 'CTR',
      uplift: 70.0,
      sampleSize: 210000,
    },
    {
      id: 'abt-4',
      name: 'Overlay Banner vs Sponsored Segment Format',
      type: 'ad-format',
      status: 'paused',
      startDate: '2026-02-01',
      variants: [
        { id: 'v-overlay', name: 'Overlay Banner (Control)', description: 'Non-intrusive 6s overlay', config: { format: 'overlay' }, impressions: 31000, conversions: 430, revenue: 285, ctr: 0.014, conversionRate: 0.013, isControl: true, isWinner: false },
        { id: 'v-segment', name: 'Sponsored Segment (Variant)', description: 'Creator-read 15s segment', config: { format: 'sponsored-segment' }, impressions: 30800, conversions: 1050, revenue: 1470, ctr: 0.034, conversionRate: 0.032, isControl: false, isWinner: false },
      ],
      confidenceLevel: 0.88,
      primaryMetric: 'Revenue',
      uplift: 415.8,
      sampleSize: 61800,
    },
  ];
}

// ─── Creator Profile ─────────────────────────────────────────────────────────
export function generateCreatorProfile(): CreatorProfile {
  return {
    id: 'creator-1',
    displayName: 'Jems Dorviene',
    handle: '@jemsDorviene',
    avatarUrl: '',
    followerCount: 284700,
    totalViews: 18_420_000,
    accountTier: 'pro',
    categories: ['tech', 'gaming', 'travel'],
    demographics: [
      { ageGroup: '18–24', percentage: 0.38, gender: 'male', topRegions: ['US', 'UK', 'CA'] },
      { ageGroup: '25–34', percentage: 0.31, gender: 'female', topRegions: ['US', 'AU', 'DE'] },
      { ageGroup: '35–44', percentage: 0.19, gender: 'male', topRegions: ['US', 'FR', 'BR'] },
      { ageGroup: '13–17', percentage: 0.12, gender: 'other', topRegions: ['US', 'IN'] },
    ],
    monetizationEnabled: true,
    payoutMethod: 'bank',
    lifetimeEarnings: 24180.42,
  };
}
