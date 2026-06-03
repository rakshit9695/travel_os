import type { Budget } from '../types';

const all = ['nitin', 'rachana', 'rakshit', 'ronit'];

export const budget: Budget = {
  committedINR: 600000, // flights + hotels + visa — locked
  liveINR: 500000, // managed live budget
  fxRate: 105, // 1 CHF ≈ ₹105 (editable)
  entries: [
    // ── Local transport ──
    {
      id: 'b-stp',
      date: '2026-06-10',
      category: 'Local transport',
      label: 'Swiss Travel Pass (4 × 6-day, 2nd class) — pre-booked',
      plannedCHF: 1436,
      actualCHF: 1436,
      paidBy: 'rakshit',
      splitAmong: all,
    },
    {
      id: 'b-gva-train',
      date: '2026-06-17',
      category: 'Local transport',
      label: 'GVA → Lausanne + local trams (covered by STP)',
      plannedCHF: 0,
      actualCHF: 0,
      paidBy: 'rakshit',
      splitAmong: all,
    },
    // ── Activities ──
    {
      id: 'b-jungfrau',
      date: '2026-06-20',
      category: 'Activities',
      label: 'Jungfraujoch tickets ×4 (STP-discounted)',
      plannedCHF: 520,
      actualCHF: 0,
      paidBy: 'nitin',
      splitAmong: all,
    },
    {
      id: 'b-pilatus',
      date: '2026-06-23',
      category: 'Activities',
      label: 'Mt. Pilatus Golden Round Trip ×4 (STP-discounted)',
      plannedCHF: 280,
      actualCHF: 0,
      paidBy: 'nitin',
      splitAmong: all,
    },
    {
      id: 'b-first',
      date: '2026-06-21',
      category: 'Activities',
      label: 'Grindelwald-First gondola ×4',
      plannedCHF: 240,
      actualCHF: 0,
      paidBy: 'rakshit',
      splitAmong: all,
    },
    {
      id: 'b-harder',
      date: '2026-06-19',
      category: 'Activities',
      label: 'Harder Kulm funicular ×4',
      plannedCHF: 110,
      actualCHF: 0,
      paidBy: 'rakshit',
      splitAmong: all,
    },
    {
      id: 'b-olympic',
      date: '2026-06-17',
      category: 'Activities',
      label: 'Olympic Museum + Trümmelbach Falls',
      plannedCHF: 120,
      actualCHF: 0,
      paidBy: 'rachana',
      splitAmong: all,
    },
    // ── Food ──
    {
      id: 'b-food-cook',
      date: '2026-06-19',
      category: 'Food',
      label: 'Groceries for apartment cooking (Coop/Migros) — budget lever',
      plannedCHF: 320,
      actualCHF: 0,
      paidBy: 'rachana',
      splitAmong: all,
    },
    {
      id: 'b-food-eatout',
      date: '2026-06-17',
      category: 'Food',
      label: 'Dinners out & lunches (8 days, veg, family of 4)',
      plannedCHF: 980,
      actualCHF: 0,
      paidBy: 'nitin',
      splitAmong: all,
    },
    // ── Shopping ──
    {
      id: 'b-shop',
      date: '2026-06-24',
      category: 'Shopping',
      label: 'Chocolate, souvenirs, gifts',
      plannedCHF: 280,
      actualCHF: 0,
      paidBy: 'rachana',
      splitAmong: all,
    },
    // ── Misc ──
    {
      id: 'b-esim',
      date: '2026-06-15',
      category: 'Misc',
      label: 'eSIM data (4 travelers)',
      plannedCHF: 60,
      actualCHF: 44,
      paidBy: 'rakshit',
      splitAmong: all,
    },
    {
      id: 'b-misc',
      date: '2026-06-17',
      category: 'Misc',
      label: 'Tips, lockers, contingency',
      plannedCHF: 150,
      actualCHF: 0,
      paidBy: 'rakshit',
      splitAmong: all,
    },
  ],
};
