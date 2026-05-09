import { BudgetState } from './types';

const KEY = 'budget-state-v1';

export const defaultState: BudgetState = {
  salary: {
    paychecks: [{ id: 'main', name: 'Primary Salary', amount: 2000 }],
    schedule: 'twice-monthly',
    anchorDate: new Date().toISOString().slice(0, 10),
    payDay1: 15,
    payDay2: 30,
    currency: 'USD',
  },
  expenses: [],
  budgets: {
    housing: 800,
    food: 300,
    utilities: 150,
    transport: 120,
    savings: 250,
    loans: 200,
    debt: 100,
    subscriptions: 60,
    entertainment: 80,
    health: 50,
    other: 50,
  },
  customCategories: [],
  disabledCategories: [],
};

export function loadState(): BudgetState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as any;
    const legacyAmount = parsed.salary?.amountPerPaycheck;
    const paychecks = parsed.salary?.paychecks ?? (legacyAmount ? [{ id: 'legacy', name: 'Primary Salary', amount: legacyAmount }] : defaultState.salary.paychecks);

    return {
      ...defaultState,
      ...parsed,
      salary: { ...defaultState.salary, ...(parsed.salary ?? {}), paychecks },
      budgets: { ...defaultState.budgets, ...(parsed.budgets ?? {}) },
      customCategories: parsed.customCategories ?? [],
      disabledCategories: parsed.disabledCategories ?? [],
      expenses: parsed.expenses ?? [],
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: BudgetState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function exportState(state: BudgetState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): BudgetState {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object' || !parsed.salary) {
    throw new Error('Invalid budget file');
  }
  const legacyAmount = parsed.salary?.amountPerPaycheck;
  const paychecks = parsed.salary?.paychecks ?? (legacyAmount ? [{ id: 'legacy', name: 'Primary Salary', amount: legacyAmount }] : defaultState.salary.paychecks);

  return {
    ...defaultState,
    ...parsed,
    salary: { ...defaultState.salary, ...parsed.salary, paychecks },
    customCategories: parsed.customCategories ?? [],
    disabledCategories: parsed.disabledCategories ?? [],
    expenses: parsed.expenses ?? [],
    budgets: { ...defaultState.budgets, ...(parsed.budgets ?? {}) },
  };
}
