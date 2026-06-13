// "People like you" cohort matching — TS port of benefitsiq/cohorts/match.py.
// Pure: takes candidate rows (all cohorts for a state) + profile, returns a
// k-anon-safe cohort or null. K-anonymity floor enforced; widening on miss.

import type { Profile, Cohort } from './types';

export const K_ANON_FLOOR = 30;

export interface CohortRow {
  state: string;
  household_band: string;
  income_band: string;
  situation: string;
  programs_typical: string; // JSON text in Postgres
  typical_apply_order: string; // JSON text
  avg_processing_days: number | null;
  expedited_pct: number | null;
  modeled_n: number;
  source_citation: string;
  source_url: string | null;
  effective_date: string | null;
}

const FPL_100_MONTHLY: Record<number, number> = {
  1: 1250, 2: 1700, 3: 2150, 4: 2600, 5: 3050, 6: 3500, 7: 3950, 8: 4400,
};

export function householdBand(size: number): string {
  if (size === 1) return '1';
  if (size === 2) return '2';
  if (size === 3) return '3';
  return '4plus';
}

export function incomeBand(profile: Profile): string {
  const income = profile.monthly_income || 0;
  const hh = profile.household_size || 1;
  const base = FPL_100_MONTHLY[hh] ?? 1250 + (hh - 1) * 450;
  const pct = base > 0 ? income / base : 0;
  if (pct < 0.5) return 'very_low';
  if (pct < 1.0) return 'low';
  if (pct < 1.85) return 'moderate';
  return 'above';
}

export function situationOf(profile: Profile): string {
  if (profile.recently_lost_job) return 'job_loss';
  if (profile.is_pregnant) return 'pregnant';
  if (profile.has_young_children) return 'has_young_children';
  return 'baseline';
}

function parseJsonArray(s: string | null): string[] {
  if (!s) return [];
  try {
    const v: unknown = JSON.parse(s);
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function toCohort(r: CohortRow): Cohort {
  return {
    label: `modeled from ${r.source_citation}, n=${r.modeled_n}`,
    modeled_n: r.modeled_n,
    apply_order: parseJsonArray(r.typical_apply_order),
    programs_typical: parseJsonArray(r.programs_typical),
    avg_processing_days: r.avg_processing_days,
    expedited_pct: r.expedited_pct,
    source: r.source_citation,
  };
}

// rows = all cohort_stats rows for the user's state.
export function matchCohort(rows: CohortRow[], profile: Profile): Cohort | null {
  if (!profile.state || !profile.household_size) return null;
  const hb = householdBand(profile.household_size);
  const ib = incomeBand(profile);
  const sit = situationOf(profile);

  const pick = (pred: (r: CohortRow) => boolean): CohortRow | null => {
    const cands = rows.filter(pred).sort((a, b) => b.modeled_n - a.modeled_n);
    return cands.length ? cands[0] : null;
  };

  // 1) exact, then widen: baseline situation, then drop income band, then any for hh band
  const attempts: ((r: CohortRow) => boolean)[] = [
    (r) => r.household_band === hb && r.income_band === ib && r.situation === sit,
    (r) => r.household_band === hb && r.income_band === ib && r.situation === 'baseline',
    (r) => r.household_band === hb && r.situation === sit,
    (r) => r.household_band === hb && r.situation === 'baseline',
    (r) => r.household_band === hb,
  ];
  for (const pred of attempts) {
    const best = pick(pred);
    if (best && best.modeled_n >= K_ANON_FLOOR) return toCohort(best);
  }
  return null;
}
