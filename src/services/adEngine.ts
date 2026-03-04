import type { Ad, InjectedAd, VideoPost, AdFormat, AdPlacement } from '../types';
import { generateAds } from './mockData';

// ─── Ad Injection Rules ───────────────────────────────────────────────────────

interface InjectionRule {
  minVideosBeforeFirst: number;   // Don't inject before this many posts
  maxAdDensity: number;           // Max 1 ad per N posts
  preferredFormats: AdFormat[];
  preferredPlacements: AdPlacement[];
}

const DEFAULT_RULES: InjectionRule = {
  minVideosBeforeFirst: 2,
  maxAdDensity: 3,
  preferredFormats: ['sponsored-segment', 'mid-roll', 'overlay'],
  preferredPlacements: ['feed', 'video-mid'],
};

// ─── InlineAdEngine ───────────────────────────────────────────────────────────

export class InlineAdEngine {
  private adPool: Ad[] = [];
  private rules: InjectionRule;
  private impressionLog: Map<string, number> = new Map();

  constructor(rules: Partial<InjectionRule> = {}) {
    this.rules = { ...DEFAULT_RULES, ...rules };
    this.adPool = generateAds();
  }

  /** Select the best-fit ad based on estimated revenue and relevance */
  private selectAd(variantId: string): Ad | null {
    if (this.adPool.length === 0) return null;
    // Score ads: higher estimated revenue + lower current impressions (freshness)
    const scored = this.adPool
      .filter(ad => this.rules.preferredFormats.includes(ad.format))
      .map(ad => ({
        ad,
        score:
          ad.estimatedRevenue * 10 +
          (1 / (1 + (this.impressionLog.get(ad.id) ?? 0) / 1000)) * 5,
        variantId,
      }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.ad ?? this.adPool[0];
  }

  /** Given a list of video posts, decide where to inject ads */
  inject(posts: VideoPost[], variantId = 'default'): InjectedAd[] {
    const injections: InjectedAd[] = [];
    const { minVideosBeforeFirst, maxAdDensity } = this.rules;

    for (let i = minVideosBeforeFirst; i < posts.length; i += maxAdDensity) {
      const ad = this.selectAd(variantId);
      if (ad) {
        injections.push({ ad, insertAfterIndex: i, variantId });
        this.impressionLog.set(ad.id, (this.impressionLog.get(ad.id) ?? 0) + 1);
      }
    }
    return injections;
  }

  /** Calculate projected revenue for a given injection set */
  projectRevenue(injections: InjectedAd[]): number {
    return injections.reduce((sum, inj) => sum + inj.ad.estimatedRevenue, 0);
  }

  /** Refresh ad pool with new creatives */
  refreshPool(): void {
    this.adPool = generateAds();
    this.impressionLog.clear();
  }

  getImpressionStats(): Record<string, number> {
    return Object.fromEntries(this.impressionLog);
  }
}

export const adEngine = new InlineAdEngine();
