import { Paycheck } from '@/lib/budget/types';
import { formatMoney } from '@/lib/budget/calculations';
import { Wallet } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Props {
  paychecks: Paycheck[];
  currency: string;
}

export function PaycheckList({ paychecks, currency }: Props) {
  if (!paychecks || paychecks.length === 0) return null;

  return (
    <section className="surface-card rounded-3xl border border-border px-4 py-2 sm:px-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="paychecks" className="border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-baseline gap-2 text-left">
              <h3 className="font-display text-lg font-semibold sm:text-xl">Income Sources</h3>
              <span className="text-xs text-muted-foreground font-normal">{paychecks.length} item{paychecks.length === 1 ? '' : 's'}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pb-2">
              {paychecks.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden>
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Paycheck</p>
                  </div>
                  <span className="tabular font-display text-base font-semibold text-success">
                    +{formatMoney(p.amount, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
