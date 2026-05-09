import { BudgetState, CategoryId, Expense, getAllCategories } from './types';
import { Period, isWithin } from './period';

export function formatMoney(amount: number, currency = 'PHP') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 1,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(1)}`;
  }
}

export function expensesForPeriod(expenses: Expense[], period: Period): Expense[] {
  return expenses.filter((e) => {
    if (e.frequency === 'recurring') return true;
    return e.date ? isWithin(e.date, period) : false;
  });
}

export interface CategoryStat {
  category: CategoryId;
  spent: number;
  budget: number;
  remaining: number;
  progress: number;
  status: 'safe' | 'warning' | 'over';
}

export function computeCategoryStats(state: BudgetState, period: Period): CategoryStat[] {
  const periodExpenses = expensesForPeriod(state.expenses, period);
  return getAllCategories(state).map((c) => {
    const spent = periodExpenses
      .filter((e) => e.category === c.id)
      .reduce((s, e) => s + e.amount, 0);
    const budget = state.budgets[c.id] ?? 0;
    const remaining = budget - spent;
    const progress = budget > 0 ? spent / budget : spent > 0 ? 1 : 0;
    const status: CategoryStat['status'] =
      progress >= 1 ? 'over' : progress >= 0.8 ? 'warning' : 'safe';
    return { category: c.id, spent, budget, remaining, progress, status };
  });
}

export interface OverallStat {
  income: number;
  budgetTotal: number;
  spent: number;
  remaining: number;
  progress: number;
  pace: number;
  status: 'safe' | 'warning' | 'over';
}

export function computeOverall(state: BudgetState, period: Period): OverallStat {
  const stats = computeCategoryStats(state, period);
  const spent = stats.reduce((s, x) => s + x.spent, 0);
  const budgetTotal = Object.values(state.budgets).reduce<number>(
    (s, v) => s + (v ?? 0),
    0,
  );
  const income = state.salary.paychecks.reduce((sum, p) => sum + p.amount, 0);
  const remaining = budgetTotal - spent;
  const progress = budgetTotal > 0 ? spent / budgetTotal : 0;
  const pace = period.progress;
  const status: OverallStat['status'] =
    progress >= 1 ? 'over' : progress > pace + 0.1 ? 'warning' : 'safe';
  return { income, budgetTotal, spent, remaining, progress, pace, status };
}
