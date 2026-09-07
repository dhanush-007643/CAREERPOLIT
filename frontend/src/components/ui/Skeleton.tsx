import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-800/60 rounded-xl border border-white/5',
        className
      )}
    />
  );
};

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

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Something went wrong',
  message = "We couldn't load the requested information from the server.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border border-red-500/20 my-4 bg-red-950/10',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-100">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Analyzing your career intelligence profile...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin absolute" />
        <span className="text-violet-400 font-bold text-lg absolute">✦</span>
      </div>
      <p className="text-sm font-semibold text-slate-200">{message}</p>
      <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
        <span className="flex items-center gap-1 text-emerald-400">✓ Skills</span>
        <span className="flex items-center gap-1 text-sky-400">✓ Resume</span>
        <span className="flex items-center gap-1 text-violet-400">◌ AI Matching</span>
      </div>
    </div>
  );
};
