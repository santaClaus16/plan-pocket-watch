import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Category, CategoryId } from '@/lib/budget/types';
import { Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  categories: Category[];
  disabledCategories: Set<CategoryId>;
  onAdd: (label: string, emoji: string, budget?: number) => void;
  onUpdate: (id: CategoryId, patch: Partial<Pick<Category, 'label' | 'emoji'>>) => void;
  onRemove: (id: CategoryId) => void;
  onToggleDisabled: (id: CategoryId) => void;
}

export function CategoryManager({
  categories,
  disabledCategories,
  onAdd,
  onUpdate,
  onRemove,
  onToggleDisabled,
}: Props) {
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('');
  const [editing, setEditing] = useState<CategoryId | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editEmoji, setEditEmoji] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return toast.error('Add a name');
    if (trimmed.length > 30) return toast.error('Name too long');
    onAdd(trimmed, emoji.trim() || '📌', 0);
    setLabel('');
    setEmoji('');
    toast.success('Category added');
  };

  const startEdit = (c: Category) => {
    setEditing(c.id);
    setEditLabel(c.label);
    setEditEmoji(c.emoji);
  };

  const saveEdit = (id: CategoryId) => {
    const trimmed = editLabel.trim();
    if (!trimmed) return toast.error('Name required');
    onUpdate(id, { label: trimmed, emoji: editEmoji.trim() || '📌' });
    setEditing(null);
    toast.success('Category updated');
  };

  return (
    <div className="space-y-3">
      <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
        Categories
      </h4>
      <p className="text-xs text-muted-foreground">
        Toggle off to hide a category from the form and lists. Disabled categories stay here so you can re-enable them anytime.
      </p>

      <ul className="space-y-2">
        {categories.map((c) => {
          const isDisabled = disabledCategories.has(c.id);
          const isEditing = editing === c.id;
          return (
            <li
              key={c.id}
              className={
                'flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/30 p-2 transition-opacity ' +
                (isDisabled ? 'opacity-60' : '')
              }
            >
              {isEditing ? (
                <>
                  <Input
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    maxLength={4}
                    className="h-10 w-14 text-center text-lg"
                    aria-label="Emoji"
                  />
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    maxLength={30}
                    className="h-10 flex-1"
                    aria-label="Name"
                  />
                  <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 text-success"
                    onClick={() => saveEdit(c.id)}
                    aria-label="Save"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground"
                    onClick={() => setEditing(null)}
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg" aria-hidden>
                    {c.emoji}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{c.label}</span>
                    {isDisabled && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Disabled
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={!isDisabled}
                    onCheckedChange={() => onToggleDisabled(c.id)}
                    aria-label={`${isDisabled ? 'Enable' : 'Disable'} ${c.label}`}
                  />
                  {!c.builtin && (
                    <>
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground"
                        onClick={() => startEdit(c)}
                        aria-label={`Edit ${c.label}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Delete "${c.label}"? Existing expenses will move to Other.`)) {
                            onRemove(c.id);
                            toast.success('Category deleted');
                          }
                        }}
                        aria-label={`Delete ${c.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={submit} className="flex items-end gap-2 pt-1">
        <div className="w-16">
          <Label htmlFor="cat-emoji" className="text-xs text-muted-foreground">Emoji</Label>
          <Input
            id="cat-emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="📌"
            maxLength={4}
            className="mt-1 h-11 text-center text-lg"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="cat-name" className="text-xs text-muted-foreground">New category</Label>
          <Input
            id="cat-name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Pets, Gifts"
            maxLength={30}
            className="mt-1 h-11"
          />
        </div>
        <Button type="submit" className="h-11 shrink-0 bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
