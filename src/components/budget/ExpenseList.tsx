import { Expense, Category, CategoryId, UNKNOWN_CATEGORY } from '@/lib/budget/types';
import { formatMoney, expensesForPeriod } from '@/lib/budget/calculations';
import { Period } from '@/lib/budget/period';
import { Button } from '@/components/ui/button';
import { Trash2, Repeat } from 'lucide-react';

interface Props {
  expenses: Expense[];
  period: Period;
  currency: string;
  categoryMap: Record<CategoryId, Category>;
  onRemove: (id: string) => void;
}

export function ExpenseList({ expenses, period, currency, categoryMap, onRemove }: Props) {
  const visible = expensesForPeriod(expenses, period);

  return (
    <section className="surface-card rounded-3xl border border-border p-4 sm:p-6">
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold sm:text-xl">This period</h3>
        <span className="text-xs text-muted-foreground">{visible.length} item{visible.length === 1 ? '' : 's'}</span>
      </header>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          No expenses yet. Add one above to start tracking.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((e) => {
            const c = categoryMap[e.category] ?? UNKNOWN_CATEGORY;
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg" aria-hidden>
                  {c.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-medium">{e.name}</p>
                    {e.frequency === 'recurring' && (
                      <Repeat className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Recurring" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.label}
                    {e.date && ` · ${new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
                <span className="tabular font-display text-base font-semibold">
                  {formatMoney(e.amount, currency)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(e.id)}
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${e.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
