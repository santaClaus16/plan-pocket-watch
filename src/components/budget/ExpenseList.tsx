import { useState } from 'react';
import { Expense, Category, CategoryId, UNKNOWN_CATEGORY } from '@/lib/budget/types';
import { formatMoney, expensesForPeriod } from '@/lib/budget/calculations';
import { Period } from '@/lib/budget/period';
import { Button } from '@/components/ui/button';
import { Trash2, Repeat, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Props {
  expenses: Expense[];
  period: Period;
  currency: string;
  categoryMap: Record<CategoryId, Category>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
}

export function ExpenseList({ expenses, period, currency, categoryMap, onRemove, onUpdate }: Props) {
  const visible = expensesForPeriod(expenses, period);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [date, setDate] = useState('');

  const openEdit = (e: Expense) => {
    setEditingExpense(e);
    setName(e.name);
    setAmount(String(e.amount));
    setCategory(e.category);
    setDate(e.date ?? '');
  };

  const closeEdit = () => setEditingExpense(null);

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    
    const amt = Number(amount);
    if (!name.trim()) return toast.error('Add a name');
    if (!Number.isFinite(amt) || amt <= 0) return toast.error('Amount must be greater than 0');
    
    onUpdate(editingExpense.id, {
      name: name.trim(),
      amount: Math.round(amt * 100) / 100,
      category,
      date: editingExpense.frequency === 'one-time' ? (date || undefined) : undefined,
    });
    
    toast.success('Expense updated');
    closeEdit();
  };

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
                <span className="tabular font-display text-base font-semibold pr-2">
                  {formatMoney(e.amount, currency)}
                </span>
                <div className="flex shrink-0 -ml-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(e)}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    aria-label={`Edit ${e.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(e.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${e.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-amt">Amount</Label>
                <Input
                  id="edit-amt"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="tabular"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(categoryMap).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="mr-2">{c.emoji}</span>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingExpense?.frequency === 'one-time' && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeEdit}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
