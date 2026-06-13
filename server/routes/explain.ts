// BenefitsIQ "Explain" route: full deterministic eligibility trace for EVERY program
// (eligible and ineligible) so judges can see the engine ruling things in AND out
// with an exact reason. The LLM does language; this engine decides eligibility.
//
// Isolated by design: helpers (num/asStr/rulesFor/getFpl) are re-implemented locally
// so we don't import non-exported symbols from benefits.ts. We only import the public
// AppKitLike interface, the pure evaluateProgram function, and shared types.

import { evaluateProgram, DEFAULT_BENEFIT_VALUES } from '../engine/eligibility';
import type { AppKitLike } from './benefits';
import type { Profile, ProgramRow, RuleRow, FplRow } from '../engine/types';

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function asStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

function rulesFor(all: RuleRow[], programId: number, state: string | null): RuleRow[] {
  const forProg = all.filter((r) => r.program_id === programId);
  const stateRules = forProg.filter((r) => r.state === state);
  return stateRules.length ? stateRules : forProg.filter((r) => r.state == null);
}

function getFpl(fpl: FplRow[], hh: number): FplRow | null {
  if (hh <= 8) return fpl.find((f) => f.household_size === hh) || null;
  const r8 = fpl.find((f) => f.household_size === 8);
  const r7 = fpl.find((f) => f.household_size === 7);
  if (!r8) return null;
  const inc = r7 ? r8.annual_amount - r7.annual_amount : 5380;
  return { year: r8.year, household_size: hh, annual_amount: r8.annual_amount + (hh - 8) * inc, region: r8.region };
}

interface ExplainResult {
  short_name: string;
  name: string;
  eligible: boolean;
  confidence: string;
  reason: string;
  estimated_annual_value: number | null;
  notes: string | null;
}

export function setupExplainRoute(appkit: AppKitLike) {
  appkit.server.extend((app) => {
    app.post('/api/explain', async (req, res) => {
      try {
        const body = (req.body ?? {}) as { profile?: Profile };
        const profile: Profile = body.profile ?? {};

        // Read synced tables as the app's service principal (granted SELECT on public.*).
        const db = appkit.lakebase;
        const [progRes, ruleRes, fplRes] = await Promise.all([
          db.query('SELECT id,name,short_name,category,description,admin_agency FROM public.programs'),
          db.query('SELECT id,program_id,state,household_size,max_gross_monthly,max_net_monthly,max_pct_fpl,categorical_eligible,notes FROM public.eligibility_rules'),
          db.query('SELECT year,household_size,annual_amount,region FROM public.fpl_thresholds WHERE year = 2024'),
        ]);

        const programs: ProgramRow[] = progRes.rows.map((p) => ({
          id: Number(p.id), name: asStr(p.name), short_name: asStr(p.short_name),
          category: (p.category as string) ?? null, description: (p.description as string) ?? null,
          admin_agency: (p.admin_agency as string) ?? null,
        }));
        const rules: RuleRow[] = ruleRes.rows.map((r) => ({
          id: Number(r.id), program_id: Number(r.program_id), state: (r.state as string) ?? null,
          household_size: num(r.household_size), max_gross_monthly: num(r.max_gross_monthly),
          max_net_monthly: num(r.max_net_monthly), max_pct_fpl: num(r.max_pct_fpl),
          categorical_eligible: r.categorical_eligible === true || r.categorical_eligible === 'true',
          notes: (r.notes as string) ?? null,
        }));
        const fpl: FplRow[] = fplRes.rows.map((f) => ({
          year: Number(f.year), household_size: Number(f.household_size),
          annual_amount: Number(f.annual_amount), region: (f.region as string) || 'contiguous',
        }));

        const hh = profile.household_size ?? 1;
        const fplRow = getFpl(fpl, hh);

        // Evaluate EVERY program (eligible AND ineligible) so the full trace is visible.
        const results: ExplainResult[] = programs.map((p) => {
          // The explain trace uses DEFAULT_BENEFIT_VALUES for simplicity; the dollar
          // values shown match the engine's fallback (and any unloaded benefit_values).
          const r = evaluateProgram(profile, p, rulesFor(rules, p.id, profile.state ?? null), fplRow, DEFAULT_BENEFIT_VALUES);
          return {
            short_name: r.program_short_name,
            name: r.program_name,
            eligible: r.eligible,
            confidence: r.confidence,
            reason: r.reason,
            estimated_annual_value: r.estimated_annual_value,
            notes: r.notes,
          };
        });

        res.json({
          profile,
          fpl: fplRow ? { household_size: fplRow.household_size, annual_amount: fplRow.annual_amount } : null,
          results,
        });
      } catch (e) {
        res.status(500).json({ error: (e as Error).message });
      }
    });
  });
}
