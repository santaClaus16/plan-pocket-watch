import { useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2, Download, Upload, RotateCcw } from 'lucide-react';
import { BudgetState, PaySchedule } from '@/lib/budget/types';
import { exportState, importState } from '@/lib/budget/storage';
import { toast } from 'sonner';

interface Props {
  state: BudgetState;
  onSalary: (s: Partial<BudgetState['salary']>) => void;
  onImport: (s: BudgetState) => void;
  onReset: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'BRL', 'MXN', 'INR', 'PHP'];

export function SettingsSheet({ state, onSalary, onImport, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (f: File) => {
    try {
      const text = await f.text();
      onImport(importState(text));
      toast.success('Budget imported');
    } catch {
      toast.error('Could not import file');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label="Settings">
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Salary</h4>
            <div>
              <Label className="text-xs text-muted-foreground">Per paycheck</Label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={state.salary.amountPerPaycheck}
                onChange={(e) => onSalary({ amountPerPaycheck: Math.max(0, Number(e.target.value) || 0) })}
                className="mt-1 h-11 tabular"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Currency</Label>
              <Select value={state.salary.currency} onValueChange={(v) => onSalary({ currency: v })}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Pay schedule</Label>
              <Select
                value={state.salary.schedule}
                onValueChange={(v) => onSalary({ schedule: v as PaySchedule })}
              >
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="twice-monthly">Twice monthly (e.g. 15th & 30th)</SelectItem>
                  <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {state.salary.schedule === 'twice-monthly' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">First pay day</Label>
                  <Input
                    type="number" min={1} max={28}
                    value={state.salary.payDay1}
                    onChange={(e) => onSalary({ payDay1: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })}
                    className="mt-1 h-11 tabular"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Second pay day</Label>
                  <Input
                    type="number" min={1} max={28}
                    value={state.salary.payDay2}
                    onChange={(e) => onSalary({ payDay2: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })}
                    className="mt-1 h-11 tabular"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs text-muted-foreground">Anchor pay date</Label>
                <Input
                  type="date"
                  value={state.salary.anchorDate}
                  onChange={(e) => onSalary({ anchorDate: e.target.value })}
                  className="mt-1 h-11"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Data</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11" onClick={doExport}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
              <Button variant="outline" className="h-11" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1.5 h-4 w-4" /> Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) doImport(f);
                  e.target.value = '';
                }}
              />
              <Button
                variant="ghost"
                className="col-span-2 h-11 text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('Reset all budget data?')) onReset();
                }}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" /> Reset everything
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
