import React from 'react';
import { cn } from '../../utils/cn';

interface MatchBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
  className?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  score,
  size = 'md',
  showSymbol = true,
  className,
}) => {
  const getColors = () => {
    if (score >= 85) {
      return 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border-violet-400/50 text-violet-200 shadow-sm shadow-violet-500/20';
    }
    if (score >= 70) {
      return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300';
    }
    if (score >= 50) {
      return 'bg-amber-500/20 border-amber-400/40 text-amber-300';
    }
    return 'bg-red-500/20 border-red-400/40 text-red-300';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px] font-bold';
      case 'lg':
        return 'px-3.5 py-1.5 text-sm font-extrabold';
      default:
        return 'px-2.5 py-1 text-xs font-bold';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border backdrop-blur-md shrink-0 font-mono tracking-tight',
        getColors(),
        getSizeStyles(),
        className
      )}
    >
      {showSymbol && <span className="text-violet-400">✦</span>}
      <span>{score}% Match</span>
    </span>
  );
};
