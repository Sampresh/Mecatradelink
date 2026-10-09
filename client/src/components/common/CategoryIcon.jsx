import { Boxes, Cable, CircuitBoard, Lightbulb, Plug, ShieldCheck, Sparkles, Square, ToggleRight, Wrench, Zap } from 'lucide-react';

// Category.icon stores one of these names (set in admin).
export const CATEGORY_ICONS = { ToggleRight, Lightbulb, Cable, ShieldCheck, Plug, Wrench, CircuitBoard, Boxes, Square, Sparkles, Zap };

export default function CategoryIcon({ name, ...props }) {
  const Icon = CATEGORY_ICONS[name] || Zap;
  return <Icon aria-hidden {...props} />;
}
