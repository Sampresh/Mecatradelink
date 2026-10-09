'use client';

import { useState } from 'react';
import { Check, Minus, Plus, ClipboardPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteList } from '@/hooks/useQuoteList';
import { cn } from '@/lib/utils';

export default function AddToQuoteButton({ product, withQuantity = false, compact = false, variant = 'primary', className, size = 'sm' }) {
  const { add, has } = useQuoteList();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const inList = has(product.id);

  const handleAdd = () => {
    add(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  if (compact) {
    const label = justAdded ? 'Added to quote list' : inList ? 'In quote list. Add one more' : 'Add to quote list';
    return (
      <Button onClick={handleAdd} size="icon" variant={inList || justAdded ? 'secondary' : 'outline'} className={cn('h-9 w-9 shrink-0', className)} aria-label={label} title={label}>
        {justAdded ? <Check className="h-4 w-4 text-success" aria-hidden /> : <ClipboardPlus className={cn('h-4 w-4', inList && 'text-primary')} aria-hidden />}
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {withQuantity && (
        <div className="flex h-14 items-center rounded-lg border border-border bg-surface">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center text-muted hover:text-foreground" aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="h-full w-16 bg-transparent text-center text-sm [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantity"
          />
          <button type="button" onClick={() => setQuantity((q) => q + 1)} className="grid h-full w-11 place-items-center text-muted hover:text-foreground" aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      <Button onClick={handleAdd} size={size} variant={inList && !justAdded ? 'outline' : variant} className={withQuantity ? 'flex-1' : 'w-full'}>
        {justAdded ? <Check className="h-4 w-4" aria-hidden /> : <ClipboardPlus className="h-4 w-4" aria-hidden />}
        {justAdded ? 'Added' : inList ? 'Add more to quote list' : 'Add to quote list'}
      </Button>
    </div>
  );
}
