import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'ai' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'secondary':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'ai':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-500/20';
      case 'success':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'error':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'outline':
        return 'bg-transparent text-slate-300 border-slate-700';
      case 'neutral':
      default:
        return 'bg-slate-800/60 text-slate-300 border-slate-700/60';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px] gap-1';
      default:
        return 'px-2.5 py-1 text-xs gap-1.5';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border backdrop-blur-md shrink-0',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
