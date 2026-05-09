/** Category IDs are arbitrary strings — built-ins use stable slugs, custom ones use uuids. */
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Built-in categories cannot be deleted (only hidden via budget=0 if needed). */
  builtin?: boolean;
}

export type ExpenseFrequency = 'recurring' | 'one-time';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: CategoryId;
  frequency: ExpenseFrequency;
  /** ISO date for one-time expenses */
  date?: string;
  createdAt: string;
}

export interface Paycheck {
  id: string;
  name: string;
  amount: number;
}

export type PaySchedule = 'twice-monthly' | 'biweekly';

export interface SalarySettings {
  paychecks: Paycheck[];
  schedule: PaySchedule;
  anchorDate: string;
  payDay1: number;
  payDay2: number;
  currency: string;
}

export interface BudgetState {
  salary: SalarySettings;
  expenses: Expense[];
  budgets: Partial<Record<CategoryId, number>>;
  /** User-defined categories on top of the built-in set. */
  customCategories: Category[];
  /** Categories hidden from forms and lists; kept so they can be re-enabled. */
  disabledCategories?: CategoryId[];
}

export const BUILTIN_CATEGORIES: Category[] = [
  { id: 'housing', label: 'Housing', emoji: '🏠', builtin: true },
  { id: 'food', label: 'Food', emoji: '🍽️', builtin: true },
  { id: 'utilities', label: 'Utilities', emoji: '💡', builtin: true },
  { id: 'transport', label: 'Transport', emoji: '🚗', builtin: true },
  { id: 'savings', label: 'Savings', emoji: '💰', builtin: true },
  { id: 'loans', label: 'Loans', emoji: '🏦', builtin: true },
  { id: 'debt', label: 'Debt', emoji: '💳', builtin: true },
  { id: 'subscriptions', label: 'Subscriptions', emoji: '🔁', builtin: true },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', builtin: true },
  { id: 'health', label: 'Health', emoji: '🩺', builtin: true },
  { id: 'other', label: 'Other', emoji: '📦', builtin: true },
];

/** Resolve full category list from state (built-ins + custom). */
export function getAllCategories(state: Pick<BudgetState, 'customCategories'>): Category[] {
  return [...BUILTIN_CATEGORIES, ...(state.customCategories ?? [])];
}

export function getCategoryMap(
  state: Pick<BudgetState, 'customCategories'>,
): Record<CategoryId, Category> {
  return getAllCategories(state).reduce(
    (acc, c) => ({ ...acc, [c.id]: c }),
    {} as Record<CategoryId, Category>,
  );
}

/** Fallback used when an expense references a deleted category. */
export const UNKNOWN_CATEGORY: Category = {
  id: 'unknown',
  label: 'Unknown',
  emoji: '❔',
};
