import type { ABTest, ABVariant, TestType } from '../types';

// ─── Statistical Helpers ──────────────────────────────────────────────────────

/** Two-proportion z-test p-value approximation */
function zTestConfidence(
  impA: number, convA: number,
  impB: number, convB: number
): number {
  if (impA < 100 || impB < 100) return 0;
  const pA = convA / impA;
  const pB = convB / impB;
  const pPool = (convA + convB) / (impA + impB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / impA + 1 / impB));
  if (se === 0) return 0;
  const z = Math.abs(pA - pB) / se;
  // Approximate CDF for normal distribution
  const p = 1 - 0.5 * Math.exp(-0.717 * z - 0.416 * z * z);
  return parseFloat(Math.min(p, 0.9999).toFixed(4));
}

function calcUplift(control: ABVariant, variant: ABVariant): number {
  if (control.revenue === 0) return 0;
  return parseFloat((((variant.revenue - control.revenue) / control.revenue) * 100).toFixed(1));
}

function determineWinner(variants: ABVariant[], confidence: number): ABVariant[] {
  if (confidence < 0.95) return variants.map(v => ({ ...v, isWinner: false }));
  const control = variants.find(v => v.isControl);
  if (!control) return variants;
  return variants.map(v => ({
    ...v,
    isWinner: !v.isControl && v.revenue > control.revenue,
  }));
}

// ─── ABTestingFramework ───────────────────────────────────────────────────────

export class ABTestingFramework {
  private tests: Map<string, ABTest> = new Map();

  constructor(initialTests: ABTest[] = []) {
    initialTests.forEach(t => this.tests.set(t.id, t));
  }

  getAll(): ABTest[] {
    return Array.from(this.tests.values());
  }

  get(id: string): ABTest | undefined {
    return this.tests.get(id);
  }

  /** Record an impression + optional conversion for a variant */
  recordEvent(testId: string, variantId: string, conversion: boolean, revenue = 0): void {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return;

    const updated = {
      ...test,
      variants: test.variants.map(v => {
        if (v.id !== variantId) return v;
        const newImpressions = v.impressions + 1;
        const newConversions = v.conversions + (conversion ? 1 : 0);
        const newRevenue = v.revenue + revenue;
        return {
          ...v,
          impressions: newImpressions,
          conversions: newConversions,
          revenue: newRevenue,
          ctr: newConversions / newImpressions,
          conversionRate: newConversions / newImpressions,
        };
      }),
    };

    // Recalculate confidence & uplift
    const ctrl = updated.variants.find(v => v.isControl);
    const variant = updated.variants.find(v => !v.isControl);
    if (ctrl && variant) {
      const confidence = zTestConfidence(
        ctrl.impressions, ctrl.conversions,
        variant.impressions, variant.conversions
      );
      const uplift = calcUplift(ctrl, variant);
      const sampleSize = updated.variants.reduce((s, v) => s + v.impressions, 0);
      const withWinners = determineWinner(updated.variants, confidence);
      this.tests.set(testId, {
        ...updated,
        variants: withWinners,
        confidenceLevel: confidence,
        uplift,
        sampleSize,
      });
    } else {
      this.tests.set(testId, updated);
    }
  }

  /** Assign a user to a variant (50/50 split) */
  assignVariant(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;
    // Deterministic assignment based on user+test hash
    const hash = [...`${userId}|${testId}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
    const idx = Math.abs(hash) % test.variants.length;
    return test.variants[idx]?.id ?? null;
  }

  pause(testId: string): void {
    const t = this.tests.get(testId);
    if (t) this.tests.set(testId, { ...t, status: 'paused' });
  }

  resume(testId: string): void {
    const t = this.tests.get(testId);
    if (t) this.tests.set(testId, { ...t, status: 'running' });
  }

  /** Create a new A/B test */
  create(name: string, type: TestType, ctaA: string, ctaB: string): ABTest {
    const id = `abt-${Date.now()}`;
    const test: ABTest = {
      id,
      name,
      type,
      status: 'running',
      startDate: new Date().toISOString().slice(0, 10),
      variants: [
        { id: `${id}-ctrl`, name: `${ctaA} (Control)`, description: '', config: { value: ctaA }, impressions: 0, conversions: 0, revenue: 0, ctr: 0, conversionRate: 0, isControl: true, isWinner: false },
        { id: `${id}-var`, name: `${ctaB} (Variant)`, description: '', config: { value: ctaB }, impressions: 0, conversions: 0, revenue: 0, ctr: 0, conversionRate: 0, isControl: false, isWinner: false },
      ],
      confidenceLevel: 0,
      primaryMetric: 'CTR',
      uplift: 0,
      sampleSize: 0,
    };
    this.tests.set(id, test);
    return test;
  }
}
