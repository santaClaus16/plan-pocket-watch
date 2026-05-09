import { useBudget } from '@/hooks/useBudget';
import { OverviewCard } from '@/components/budget/OverviewCard';
import { CategoryList } from '@/components/budget/CategoryList';
import { ExpenseForm } from '@/components/budget/ExpenseForm';
import { ExpenseList } from '@/components/budget/ExpenseList';
import { SettingsSheet } from '@/components/budget/SettingsSheet';
import { PaycheckList } from '@/components/budget/PaycheckList';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const b = useBudget();

  return (
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-mustard shadow-mustard-glow">
              <span className="font-display text-base font-bold italic text-primary-foreground">P</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none">pezo </h1>
              <p className="text-[11px] text-muted-foreground">pezo budget</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SettingsSheet
              state={b.state}
              categories={b.allCategories}
              disabledCategories={b.disabledCategories}
              onSalary={b.updateSalary}
              onAddCategory={b.addCategory}
              onUpdateCategory={b.updateCategory}
              onRemoveCategory={b.removeCategory}
              onToggleCategoryDisabled={b.toggleCategoryDisabled}
              onImport={b.replaceState}
              onReset={b.resetState}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8">
        <OverviewCard period={b.period} overall={b.overall} currency={b.state.salary.currency} />
        <PaycheckList paychecks={b.state.salary.paychecks} currency={b.state.salary.currency} />
        <ExpenseForm categories={b.categories} onAdd={b.addExpense} />
        <CategoryList
          stats={b.categoryStats}
          currency={b.state.salary.currency}
          categoryMap={b.categoryMap}
          onBudgetChange={b.setCategoryBudget}
        />
        <ExpenseList
          expenses={b.state.expenses}
          period={b.period}
          currency={b.state.salary.currency}
          categoryMap={b.categoryMap}
          onRemove={b.removeExpense}
        />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Saved locally on this device · Export from settings to back up
        </p>
      </div>
    </main>
  );
};

export default Index;
