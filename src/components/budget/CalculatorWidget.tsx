import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function CalculatorWidget() {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleDigit = (digit: string) => {
    if (waitingForNewValue) {
      setCurrent(digit);
      setWaitingForNewValue(false);
    } else {
      setCurrent(current === '0' ? digit : current + digit);
    }
  };

  const handleOperator = (op: string) => {
    if (operator && !waitingForNewValue) {
      handleEqual();
    }
    setPrevious(current);
    setOperator(op);
    setWaitingForNewValue(true);
  };

  const handleEqual = () => {
    if (!operator || !previous) return;
    
    const prev = parseFloat(previous);
    const curr = parseFloat(current);
    let result = 0;

    switch (operator) {
      case '+': result = prev + curr; break;
      case '-': result = prev - curr; break;
      case '*': result = prev * curr; break;
      case '/': result = prev / curr; break;
    }

    // Limit decimal places to avoid floating point issues
    const stringResult = String(Math.round(result * 100000000) / 100000000);
    setCurrent(stringResult);
    setPrevious(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setCurrent('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!current.includes('.')) {
      setCurrent(current + '.');
    }
  };

  const handleDelete = () => {
    if (waitingForNewValue) return;
    setCurrent(current.length > 1 ? current.slice(0, -1) : '0');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Calculator className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open calculator</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          {/* Display */}
          <div className="rounded-xl border border-border bg-secondary/50 p-3 text-right shadow-inner">
            <div className="h-4 text-xs text-muted-foreground font-medium">
              {previous ? `${previous} ${operator}` : ''}
            </div>
            <div className="font-display text-3xl font-semibold tracking-tight truncate mt-1">
              {current}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <Button variant="secondary" onClick={handleClear} className="col-span-2 font-semibold">C</Button>
            <Button variant="secondary" onClick={handleDelete} className="font-semibold">⌫</Button>
            <Button variant="outline" onClick={() => handleOperator('/')} className="font-semibold text-primary">/</Button>

            <Button variant="ghost" onClick={() => handleDigit('7')} className="font-medium text-lg">7</Button>
            <Button variant="ghost" onClick={() => handleDigit('8')} className="font-medium text-lg">8</Button>
            <Button variant="ghost" onClick={() => handleDigit('9')} className="font-medium text-lg">9</Button>
            <Button variant="outline" onClick={() => handleOperator('*')} className="font-semibold text-primary">×</Button>

            <Button variant="ghost" onClick={() => handleDigit('4')} className="font-medium text-lg">4</Button>
            <Button variant="ghost" onClick={() => handleDigit('5')} className="font-medium text-lg">5</Button>
            <Button variant="ghost" onClick={() => handleDigit('6')} className="font-medium text-lg">6</Button>
            <Button variant="outline" onClick={() => handleOperator('-')} className="font-semibold text-primary">-</Button>

            <Button variant="ghost" onClick={() => handleDigit('1')} className="font-medium text-lg">1</Button>
            <Button variant="ghost" onClick={() => handleDigit('2')} className="font-medium text-lg">2</Button>
            <Button variant="ghost" onClick={() => handleDigit('3')} className="font-medium text-lg">3</Button>
            <Button variant="outline" onClick={() => handleOperator('+')} className="font-semibold text-primary">+</Button>

            <Button variant="ghost" onClick={() => handleDigit('0')} className="col-span-2 font-medium text-lg">0</Button>
            <Button variant="ghost" onClick={handleDecimal} className="font-bold text-lg">.</Button>
            <Button onClick={handleEqual} className="bg-gradient-primary text-primary-foreground font-bold shadow-elegant hover:opacity-90">=</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
