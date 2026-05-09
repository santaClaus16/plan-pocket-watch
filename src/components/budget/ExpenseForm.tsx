import { useState } from 'react';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Category, CategoryId, Expense } from '@/lib/budget/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  categories: Category[];
  onAdd: (e: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export function ExpenseForm({ categories, onAdd }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [frequency, setFrequency] = useState<'one-time' | 'recurring'>('one-time');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!name.trim()) return toast.error('Add a name');
    if (!Number.isFinite(amt) || amt <= 0) return toast.error('Amount must be greater than 0');
    if (name.length > 60) return toast.error('Name too long');

    onAdd({
      name: name.trim(),
      amount: Math.round(amt * 100) / 100,
      category,
      frequency,
      date: frequency === 'one-time' ? date : undefined,
    });
    setName('');
    setAmount('');
    toast.success('Expense added');
  };

  return (
    <section className="surface-card rounded-3xl border border-border px-4 py-2 sm:px-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="expense-form" className="border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <h3 className="font-display text-lg font-semibold sm:text-xl text-left">Add expense</h3>
          </AccordionTrigger>
          <AccordionContent>
            <form onSubmit={submit} className="space-y-4 pb-2">
              <Tabs value={frequency} onValueChange={(v) => setFrequency(v as 'one-time' | 'recurring')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="one-time">One-time</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring</TabsTrigger>
                </TabsList>
                <TabsContent value="one-time" className="mt-4 space-y-1">
                  <Label htmlFor="exp-date" className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11"
                  />
                </TabsContent>
                <TabsContent value="recurring" className="mt-4 text-xs text-muted-foreground">
                  Counts toward every pay period until removed.
                </TabsContent>
              </Tabs>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="exp-name" className="text-xs text-muted-foreground">Name</Label>
                  <Input
                    id="exp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Groceries"
                    maxLength={60}
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-amt" className="text-xs text-muted-foreground">Amount</Label>
                  <Input
                    id="exp-amt"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 h-11 tabular"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="mr-2">{c.emoji}</span>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" size="lg" className="h-12 w-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
                <Plus className="mr-1.5 h-4 w-4" /> Add expense
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
