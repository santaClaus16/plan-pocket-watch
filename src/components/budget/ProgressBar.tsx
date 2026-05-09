import { cn } from '@/lib/utils';

interface Props {
  value: number; // 0..1+
  pace?: number; // 0..1 expected progress marker
  status?: 'safe' | 'warning' | 'over' | 'success';
  className?: string;
  height?: number;
}

const colors: Record<NonNullable<Props['status']>, string> = {
  safe: 'bg-gradient-to-r from-primary to-primary-glow',
  warning: 'bg-gradient-to-r from-warning to-[hsl(20_95%_60%)]',
  over: 'bg-gradient-to-r from-destructive to-[hsl(340_85%_60%)]',
  success: 'bg-gradient-to-r from-success to-[hsl(150_65%_45%)]',
};

export function ProgressBar({ value, pace, status = 'safe', className, height = 10 }: Props) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-full bg-secondary/60', className)}
      style={{ height }}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', colors[status])}
        style={{ width: `${pct}%` }}
      />
      {pace !== undefined && (
        <div
          className="absolute top-0 h-full w-px bg-foreground/60"
          style={{ left: `${Math.min(100, pace * 100)}%` }}
          aria-hidden
        />
      )}
    </div>
  );
}
