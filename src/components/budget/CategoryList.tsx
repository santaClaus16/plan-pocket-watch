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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

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
    <section className="surface-card rounded-3xl border border-border px-4 py-2 sm:px-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="category-list" className="border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-baseline justify-between w-full pr-4 text-left">
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-lg font-semibold sm:text-xl">Budget Overview</h3>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Tabs defaultValue="spending" className="w-full">
              <TabsList className="mb-4 w-full grid grid-cols-3">
                <TabsTrigger value="spending">Spending</TabsTrigger>
                <TabsTrigger value="targets">Targets</TabsTrigger>
                <TabsTrigger value="monitoring">Graph</TabsTrigger>
              </TabsList>

              <TabsContent value="spending">
                <Accordion type="multiple" className="space-y-2 pb-2">
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
                                <span className={
                                  'font-semibold ' +
                                  (s.remaining < 0 ? 'text-destructive' : s.remaining === 0 ? 'text-success' : 'text-primary')
                                }>
                                  {formatMoney(s.spent, currency)}
                                </span>
                                {' / '}
                                {formatMoney(s.budget, currency)}
                              </span>
                            </div>
                            <ProgressBar value={s.progress} status={s.status} height={8} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="flex flex-col">
                            <p className="text-xs text-muted-foreground">
                              {s.remaining < 0 ? 'Overspent by' : 'Remaining Budget'}
                            </p>
                            <p
                              className={
                                'tabular font-display text-xl font-semibold ' +
                                (s.remaining < 0 ? 'text-destructive' : s.remaining === 0 ? 'text-success' : 'text-primary')
                              }
                            >
                              {formatMoney(Math.abs(s.remaining), currency)}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>

              <TabsContent value="targets">
                <div className="space-y-2 pb-2">
                  {stats.map((s) => {
                    const cat = categoryMap[s.category] ?? UNKNOWN_CATEGORY;
                    return (
                      <div key={s.category} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg" aria-hidden>{cat.emoji}</span>
                          <span className="font-medium">{cat.label}</span>
                        </div>
                        <div className="flex-1 max-w-[140px]">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              {currency}
                            </span>
                            <Input
                              id={`target-${s.category}`}
                              type="text"
                              value={draftBudgets[s.category] ?? String(s.budget)}
                              onChange={(e) => setDraftBudgets((current) => ({ ...current, [s.category]: e.target.value }))}
                              onBlur={(e) => commitBudget(s.category, e.target.value, s.budget)}
                              className="h-10 pl-8 tabular text-right"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="monitoring">
                <div className="rounded-2xl border border-border/60 bg-secondary/10 p-4 h-[300px] w-full">
                  <ChartContainer
                    config={{
                      spent: {
                        label: 'Spent',
                        color: 'hsl(var(--primary))',
                      },
                      budget: {
                        label: 'Budget',
                        color: 'hsl(var(--mustard))',
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.map(s => ({
                          category: (categoryMap[s.category] ?? UNKNOWN_CATEGORY).label,
                          spent: s.spent,
                          budget: s.budget
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="category"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tickFormatter={(value) => formatMoney(value, currency)}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                          width={80}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="budget" fill="var(--color-budget)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                          {stats.map((s, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                s.status === 'over' ? 'hsl(var(--destructive))' :
                                  s.status === 'warning' ? 'hsl(var(--warning))' :
                                    s.status === 'success' ? 'hsl(var(--success))' :
                                      'hsl(var(--primary))'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
