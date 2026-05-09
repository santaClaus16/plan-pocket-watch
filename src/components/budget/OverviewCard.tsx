import { useBudget } from '@/hooks/useBudget';
import { formatMoney } from '@/lib/budget/calculations';
import { ProgressBar } from './ProgressBar';
import { CalendarDays, TrendingUp, Wallet, AlertCircle, Target } from 'lucide-react';

type B = ReturnType<typeof useBudget>;

export function OverviewCard({ period, overall, currency }: { period: B['period']; overall: B['overall']; currency: string }) {
  const statusLabel =
    overall.status === 'over' ? 'Over budget' : overall.status === 'warning' ? 'Spending fast' : overall.status === 'success' ? 'Target met' : 'On track';

  const actualFunds = overall.income - overall.spent;
  const isLackingFunds = overall.remaining > 0 && actualFunds < overall.remaining;
  const lackingAmount = overall.remaining - actualFunds;
  const futureBalance = actualFunds - Math.max(0, overall.remaining);

  return (
    <section className="surface-card relative overflow-hidden rounded-3xl border border-border p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Current period</p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{period.label}</h2>
          </div>
          <span
            className={
              'rounded-full border px-3 py-1 text-xs font-medium ' +
              (overall.status === 'over'
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : overall.status === 'warning'
                  ? 'border-warning/40 bg-warning/10 text-warning'
                  : 'border-success/40 bg-success/10 text-success')
            }
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Wallet className="h-4 w-4" />} label="Income" value={formatMoney(overall.income, currency)} />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Spent" value={formatMoney(overall.spent, currency)} />
          <Stat
            label={overall.remaining < 0 ? "Overspent" : "Target"}
            icon={<Target className="h-4 w-4" />}
            // label="Target"
            value={formatMoney(Math.abs(overall.remaining), currency)}
            accent={overall.remaining >= 0}
            valueClassName={overall.remaining < 0 ? "text-destructive" : undefined}
          />
          <Stat icon={<CalendarDays className="h-4 w-4" />} label="Days left" value={`${period.daysRemaining}`} />
        </div>

        {(isLackingFunds || overall.income > 0) && (
          isLackingFunds ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <span className="font-semibold">Insufficient funds: </span>
                {actualFunds < 0 ? (
                  <>You have already overspent your income by {formatMoney(Math.abs(actualFunds), currency)} and still have {formatMoney(overall.remaining, currency)} in planned expenses.</>
                ) : (
                  <>You have {formatMoney(actualFunds, currency)} available, but your remaining budget is {formatMoney(overall.remaining, currency)}. You lack {formatMoney(lackingAmount, currency)} to cover it.</>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <span className="font-semibold">Future balance: </span>
                {futureBalance > 0 ? (
                  <>If you stick to your budget, you'll have {formatMoney(futureBalance, currency)} left over.</>
                ) : (
                  <>Your income exactly covers your budget. You'll have a zero balance.</>
                )}
              </div>
            </div>
          )
        )}

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Spending vs. budget</span>
            <span className="tabular font-medium">
              {formatMoney(overall.spent, currency)} / {formatMoney(overall.budgetTotal, currency)}
            </span>
          </div>
          <ProgressBar value={overall.progress} pace={overall.pace} status={overall.status} height={14} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(overall.progress * 100)}% spent</span>
            <span>{Math.round(period.progress * 100)}% of period elapsed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value, accent, valueClassName }: { icon?: React.ReactNode; label: string; value: string; accent?: boolean; valueClassName?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1 tabular font-display text-lg font-semibold sm:text-xl ${accent ? 'text-gradient' : ''} ${valueClassName || ''}`.trim()}>
        {value}
      </div>
    </div>
  );
}
