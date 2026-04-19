import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BudgetState,
  Category,
  CategoryId,
  Expense,
  SalarySettings,
  getAllCategories,
  getCategoryMap,
} from '@/lib/budget/types';
import { loadState, saveState, defaultState } from '@/lib/budget/storage';
import { getCurrentPeriod } from '@/lib/budget/period';
import { computeCategoryStats, computeOverall } from '@/lib/budget/calculations';

export function useBudget() {
  const [state, setState] = useState<BudgetState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const period = useMemo(() => getCurrentPeriod(state.salary, now), [state.salary, now]);
  const categoryStats = useMemo(() => computeCategoryStats(state, period), [state, period]);
  const overall = useMemo(() => computeOverall(state, period), [state, period]);
  const categories = useMemo(() => getAllCategories(state), [state]);
  const categoryMap = useMemo(() => getCategoryMap(state), [state]);

  const updateSalary = useCallback(
    (s: Partial<SalarySettings>) => setState((p) => ({ ...p, salary: { ...p.salary, ...s } })),
    [],
  );

  const setCategoryBudget = useCallback((id: CategoryId, value: number) => {
    setState((p) => ({ ...p, budgets: { ...p.budgets, [id]: value } }));
  }, []);

  const addExpense = useCallback((e: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...e,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setState((p) => ({ ...p, expenses: [expense, ...p.expenses] }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setState((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) }));
  }, []);

  const addCategory = useCallback((label: string, emoji: string, budget = 0) => {
    const id = crypto.randomUUID();
    const cat: Category = { id, label: label.trim(), emoji: emoji.trim() || '📌' };
    setState((p) => ({
      ...p,
      customCategories: [...p.customCategories, cat],
      budgets: { ...p.budgets, [id]: budget },
    }));
    return cat;
  }, []);

  const updateCategory = useCallback(
    (id: CategoryId, patch: Partial<Pick<Category, 'label' | 'emoji'>>) => {
      setState((p) => ({
        ...p,
        customCategories: p.customCategories.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      }));
    },
    [],
  );

  const removeCategory = useCallback((id: CategoryId, fallback: CategoryId = 'other') => {
    setState((p) => ({
      ...p,
      customCategories: p.customCategories.filter((c) => c.id !== id),
      expenses: p.expenses.map((e) => (e.category === id ? { ...e, category: fallback } : e)),
      budgets: Object.fromEntries(
        Object.entries(p.budgets).filter(([k]) => k !== id),
      ) as BudgetState['budgets'],
    }));
  }, []);

  const replaceState = useCallback((s: BudgetState) => setState(s), []);
  const resetState = useCallback(() => setState(defaultState), []);

  return {
    state,
    period,
    overall,
    categoryStats,
    categories,
    categoryMap,
    updateSalary,
    setCategoryBudget,
    addExpense,
    removeExpense,
    addCategory,
    updateCategory,
    removeCategory,
    replaceState,
    resetState,
  };
}
