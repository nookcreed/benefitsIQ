// ILLUSTRATIVE seed data for demo impact display. These are modeled realistic values, not real individuals.
// Seeder is idempotent: inserts ~500 events only if fewer than 400 exist.

import type { AppKitLike } from './benefits';

const STATES = [
  { code: 'CA', weight: 15 },
  { code: 'TX', weight: 12 },
  { code: 'FL', weight: 10 },
  { code: 'NY', weight: 9 },
  { code: 'GA', weight: 6 },
  { code: 'OH', weight: 5 },
  { code: 'PA', weight: 5 },
  { code: 'IL', weight: 5 },
  { code: 'NC', weight: 5 },
  { code: 'MI', weight: 4 },
  { code: 'VA', weight: 4 },
  { code: 'AZ', weight: 3 },
  { code: 'WA', weight: 3 },
  { code: 'MA', weight: 3 },
  { code: 'IN', weight: 3 },
  { code: 'TN', weight: 3 },
  { code: 'MO', weight: 2 },
  { code: 'WI', weight: 2 },
  { code: 'CO', weight: 2 },
  { code: 'OR', weight: 2 },
];

const PROGRAMS = ['SNAP', 'MEDICAID', 'CHIP', 'WIC', 'LIHEAP', 'NSLP'] as const;

// Base value ranges per program (dollars/year); adjusted by household size in generator.
const VALUE_RANGE: Record<typeof PROGRAMS[number], { min: number; max: number }> = {
  SNAP: { min: 3500, max: 12000 },
  MEDICAID: { min: 4000, max: 9000 },
  CHIP: { min: 3600, max: 3600 }, // per child
  WIC: { min: 600, max: 600 },
  LIHEAP: { min: 500, max: 500 },
  NSLP: { min: 900, max: 900 }, // per child
};

function pickWeighted<T>(items: { item: T; weight: number }[]): T {
  const sum = items.reduce((a, b) => a + b.weight, 0);
  const rand = Math.random() * sum;
  let cumulative = 0;
  for (const { item, weight } of items) {
    cumulative += weight;
    if (rand < cumulative) return item;
  }
  const last = items[items.length - 1];
  if (!last) throw new Error('[impact_seed] Empty items array in pickWeighted');
  return last.item;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateRow(): {
  state: string;
  household_size: number;
  programs_found: number;
  estimated_annual_value: number;
  programs_list: string;
  created_at: string;
} {
  const state = pickWeighted(STATES.map((s) => ({ item: s.code, weight: s.weight })));
  const household_size = pickWeighted([
    { item: 1, weight: 10 },
    { item: 2, weight: 30 },
    { item: 3, weight: 25 },
    { item: 4, weight: 20 },
    { item: 5, weight: 10 },
    { item: 6, weight: 5 },
  ]);
  const programs_found = pickWeighted([
    { item: 1, weight: 15 },
    { item: 2, weight: 35 },
    { item: 3, weight: 30 },
    { item: 4, weight: 15 },
    { item: 5, weight: 5 },
  ]);

  // Pick programs (weighted to favor SNAP/MEDICAID)
  const programPool = [...PROGRAMS];
  const selected: (typeof PROGRAMS[number])[] = [];
  for (let i = 0; i < programs_found; i++) {
    if (programPool.length === 0) break;
    const weights = programPool.map((p) => {
      if (p === 'SNAP') return 3;
      if (p === 'MEDICAID') return 3;
      if (p === 'CHIP' && household_size > 1) return 2;
      if (p === 'NSLP' && household_size > 1) return 2;
      return 1;
    });
    const idx = pickWeighted(
      programPool.map((_prog, i) => {
        const w = weights[i];
        if (w === undefined) throw new Error('[impact_seed] Missing weight for program');
        return { item: i, weight: w };
      }),
    );
    const prog = programPool[idx];
    if (prog === undefined) throw new Error('[impact_seed] Invalid program index');
    selected.push(prog);
    programPool.splice(idx, 1);
  }

  // Estimate value: sum per-program base + household size multiplier for child-centric programs.
  const children = Math.max(0, household_size - 2); // rough proxy
  let totalValue = 0;
  for (const prog of selected) {
    const { min, max } = VALUE_RANGE[prog];
    let base = randFloat(min, max);
    if ((prog === 'CHIP' || prog === 'NSLP') && children > 0) {
      base *= children;
    }
    if (prog === 'SNAP') {
      base *= 0.5 + household_size * 0.2; // scale SNAP by household size
    }
    totalValue += base;
  }

  // Timestamp: random over last 90 days
  const daysAgo = randInt(0, 90);
  const hoursAgo = randInt(0, 23);
  const minutesAgo = randInt(0, 59);
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo, minutesAgo, randInt(0, 59), 0);

  return {
    state,
    household_size,
    programs_found: selected.length,
    estimated_annual_value: Math.round(totalValue * 100) / 100,
    programs_list: JSON.stringify(selected),
    created_at: now.toISOString(),
  };
}

export async function ensureImpactSeeded(appkit: AppKitLike): Promise<void> {
  try {
    // Check current count; idempotent guard.
    const { rows } = await appkit.lakebase.query('SELECT COUNT(*)::int AS n FROM app.impact_events');
    const count = Number(rows[0]?.n ?? 0);
    if (count >= 400) {
      console.log(`[impact_seed] Found ${count} existing events; skipping seed.`);
      return;
    }

    console.log('[impact_seed] Seeding ~500 illustrative impact events...');
    const events = Array.from({ length: 500 }, () => generateRow());

    // Insert in batches of 100.
    const batchSize = 100;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      const valuesClauses = batch.map(
        (_, idx) =>
          `($${idx * 6 + 1}, $${idx * 6 + 2}, $${idx * 6 + 3}, $${idx * 6 + 4}, $${idx * 6 + 5}, $${idx * 6 + 6}::TIMESTAMPTZ)`,
      );
      const sql = `INSERT INTO app.impact_events (state, household_size, programs_found, estimated_annual_value, programs_list, created_at) VALUES ${valuesClauses.join(',')}`;
      const params = batch.flatMap((e) => [
        e.state,
        e.household_size,
        e.programs_found,
        e.estimated_annual_value,
        e.programs_list,
        e.created_at,
      ]);
      await appkit.lakebase.query(sql, params);
    }

    console.log(`[impact_seed] Inserted ${events.length} events.`);
  } catch (e) {
    console.warn('[impact_seed] Seeding failed:', (e as Error).message);
  }
}
