export type CategoryId =
  | 'housing'
  | 'food'
  | 'utilities'
  | 'transport'
  | 'savings'
  | 'entertainment'
  | 'health'
  | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
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

export type PaySchedule = 'twice-monthly' | 'biweekly';

export interface SalarySettings {
  /** Amount paid PER paycheck */
  amountPerPaycheck: number;
  schedule: PaySchedule;
  /** ISO date — for biweekly: anchor pay date. For twice-monthly: ignored, use payDay1/payDay2 */
  anchorDate: string;
  payDay1: number; // e.g. 15
  payDay2: number; // e.g. 30
  currency: string;
}

export interface BudgetState {
  salary: SalarySettings;
  expenses: Expense[];
  /** Per-category planned budget for a single pay period */
  budgets: Partial<Record<CategoryId, number>>;
}

export const CATEGORIES: Category[] = [
  { id: 'housing', label: 'Housing', emoji: '🏠' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'utilities', label: 'Utilities', emoji: '💡' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'savings', label: 'Savings', emoji: '💰' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'health', label: 'Health', emoji: '🩺' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<CategoryId, Category>,
);
