import { CATEGORY_MAP } from '@/lib/budget/types';
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
  onBudgetChange: (id: CategoryStat['category'], value: number) => void;
}

export function CategoryList({ stats, currency, onBudgetChange }: Props) {
  return (
    <section className="surface-card rounded-3xl border border-border p-4 sm:p-6">
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold sm:text-xl">By category</h3>
        <span className="text-xs text-muted-foreground">Tap to edit budget</span>
      </header>
      <Accordion type="multiple" className="space-y-2">
        {stats.map((s) => {
          const cat = CATEGORY_MAP[s.category];
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
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={s.budget}
                      onChange={(e) => onBudgetChange(s.category, Math.max(0, Number(e.target.value) || 0))}
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
