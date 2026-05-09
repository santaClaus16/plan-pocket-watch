import { useEffect, useRef, useState } from 'react';
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
import { BudgetState, Category, CategoryId, PaySchedule } from '@/lib/budget/types';
import { exportState, importState } from '@/lib/budget/storage';
import { CategoryManager } from './CategoryManager';
import { toast } from 'sonner';

interface Props {
  state: BudgetState;
  categories: Category[];
  onSalary: (s: Partial<BudgetState['salary']>) => void;
  onAddCategory: (label: string, emoji: string, budget?: number) => void;
  onUpdateCategory: (id: CategoryId, patch: Partial<Pick<Category, 'label' | 'emoji'>>) => void;
  onRemoveCategory: (id: CategoryId) => void;
  onImport: (s: BudgetState) => void;
  onReset: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'BRL', 'MXN', 'INR', 'PHP'];

export function SettingsSheet({
  state,
  categories,
  onSalary,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onImport,
  onReset,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paycheckAmount, setPaycheckAmount] = useState(String(state.salary.amountPerPaycheck));
  const [payDay1, setPayDay1] = useState(String(state.salary.payDay1));
  const [payDay2, setPayDay2] = useState(String(state.salary.payDay2));

  useEffect(() => setPaycheckAmount(String(state.salary.amountPerPaycheck)), [state.salary.amountPerPaycheck]);
  useEffect(() => setPayDay1(String(state.salary.payDay1)), [state.salary.payDay1]);
  useEffect(() => setPayDay2(String(state.salary.payDay2)), [state.salary.payDay2]);

  const commitAmount = (value: string) => {
    const amount = Number(value);
    if (value.trim() !== '' && Number.isFinite(amount) && amount >= 0) {
      onSalary({ amountPerPaycheck: amount });
      return;
    }
    setPaycheckAmount(String(state.salary.amountPerPaycheck));
  };

  const commitPayDay = (key: 'payDay1' | 'payDay2', value: string) => {
    const day = Number(value);
    if (value.trim() !== '' && Number.isFinite(day)) {
      const clampedDay = Math.min(31, Math.max(1, Math.round(day)));
      onSalary({ [key]: clampedDay });
      if (key === 'payDay1') setPayDay1(String(clampedDay));
      if (key === 'payDay2') setPayDay2(String(clampedDay));
      return;
    }
    if (key === 'payDay1') setPayDay1(String(state.salary.payDay1));
    if (key === 'payDay2') setPayDay2(String(state.salary.payDay2));
  };

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
                type="text"
                value={paycheckAmount}
                onChange={(e) => setPaycheckAmount(e.target.value)}
                onBlur={(e) => commitAmount(e.target.value)}
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
                    type="text"
                    value={payDay1}
                    onChange={(e) => setPayDay1(e.target.value)}
                    onBlur={(e) => commitPayDay('payDay1', e.target.value)}
                    className="mt-1 h-11 tabular"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Second pay day</Label>
                  <Input
                    type="text"
                    value={payDay2}
                    onChange={(e) => setPayDay2(e.target.value)}
                    onBlur={(e) => commitPayDay('payDay2', e.target.value)}
                    className="mt-1 h-11 tabular"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs text-muted-foreground">Anchor pay date</Label>
                <Input
                  type="text"
                  value={state.salary.anchorDate}
                  onChange={(e) => onSalary({ anchorDate: e.target.value })}
                  placeholder="YYYY-MM-DD"
                  className="mt-1 h-11"
                />
              </div>
            )}
          </div>

          <CategoryManager
            categories={categories}
            onAdd={onAddCategory}
            onUpdate={onUpdateCategory}
            onRemove={onRemoveCategory}
          />

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
