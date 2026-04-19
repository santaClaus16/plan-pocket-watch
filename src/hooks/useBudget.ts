import { useCallback, useEffect, useMemo, useState } from 'react';
import { BudgetState, Expense, SalarySettings, CategoryId } from '@/lib/budget/types';
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

  // tick every minute so "real-time" progress updates without remount
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const period = useMemo(() => getCurrentPeriod(state.salary, now), [state.salary, now]);
  const categoryStats = useMemo(() => computeCategoryStats(state, period), [state, period]);
  const overall = useMemo(() => computeOverall(state, period), [state, period]);

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

  const replaceState = useCallback((s: BudgetState) => setState(s), []);
  const resetState = useCallback(() => setState(defaultState), []);

  return {
    state,
    period,
    overall,
    categoryStats,
    updateSalary,
    setCategoryBudget,
    addExpense,
    removeExpense,
    replaceState,
    resetState,
  };
}
