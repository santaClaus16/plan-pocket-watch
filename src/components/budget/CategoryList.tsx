import { useEffect, useState } from 'react';
import { Category, CategoryId, UNKNOWN_CATEGORY } from '@/lib/budget/types';
import { CategoryStat, formatMoney } from '@/lib/budget/calculations';
import { ProgressBar } from './ProgressBar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  stats: CategoryStat[];
  currency: string;
  categoryMap: Record<CategoryId, Category>;
  onBudgetChange: (id: CategoryId, value: number) => void;
}

export function CategoryList({ stats, currency, categoryMap, onBudgetChange }: Props) {
  const [draftBudgets, setDraftBudgets] = useState<Record<CategoryId, string>>({});

  useEffect(() => {
    setDraftBudgets(
      stats.reduce(
        (acc, s) => ({ ...acc, [s.category]: String(s.budget) }),
        {} as Record<CategoryId, string>,
      ),
    );
  }, [stats]);

  const commitBudget = (category: CategoryId, value: string, fallback: number) => {
    const budget = Number(value);
    if (value.trim() !== '' && Number.isFinite(budget) && budget >= 0) {
      onBudgetChange(category, budget);
      return;
    }
    setDraftBudgets((current) => ({ ...current, [category]: String(fallback) }));
  };

  return (
    <section className="surface-card rounded-3xl border border-border p-4 sm:p-6">
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold sm:text-xl">By category</h3>
        <span className="text-xs text-muted-foreground">Tap to edit budget</span>
      </header>
      <Accordion type="multiple" className="space-y-2">
        {stats.map((s) => {
          const cat = categoryMap[s.category] ?? UNKNOWN_CATEGORY;
          return (
            <AccordionItem
              key={s.category}
              value={s.category}
              className="overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 px-4"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex w-full flex-col gap-2 pr-2 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>{cat.emoji}</span>
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <span className="tabular text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{formatMoney(s.spent, currency)}</span>
                      {' / '}
                      {formatMoney(s.budget, currency)}
                    </span>
                  </div>
                  <ProgressBar value={s.progress} status={s.status} height={8} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`b-${s.category}`} className="text-xs text-muted-foreground">
                      Budget for this period
                    </Label>
                    <Input
                      id={`b-${s.category}`}
                      type="text"
                      value={draftBudgets[s.category] ?? String(s.budget)}
                      onChange={(e) => setDraftBudgets((current) => ({ ...current, [s.category]: e.target.value }))}
                      onBlur={(e) => commitBudget(s.category, e.target.value, s.budget)}
                      className="mt-1 h-11 tabular"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p
                      className={
                        'tabular font-display text-xl font-semibold ' +
                        (s.remaining < 0 ? 'text-destructive' : 'text-foreground')
                      }
                    >
                      {formatMoney(s.remaining, currency)}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
