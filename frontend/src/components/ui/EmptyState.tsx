import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}> = ({ icon, title, description, actionLabel, onAction, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center glass-panel rounded-2xl border border-white/5 my-4',
        className
      )}
    >
      {icon ? (
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
          {icon}
        </div>
      ) : null}
      <h4 className="text-base font-bold text-slate-100">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
