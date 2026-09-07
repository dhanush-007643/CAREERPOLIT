import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ai' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold shadow-lg shadow-sky-500/20';
      case 'secondary':
        return 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/60';
      case 'ai':
        return 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/25 border border-violet-400/30';
      case 'outline':
        return 'bg-transparent border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400';
      case 'ghost':
        return 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/50';
      case 'danger':
        return 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-lg gap-1.5';
      case 'lg':
        return 'px-6 py-3.5 text-base rounded-xl gap-2.5';
      default:
        return 'px-4 py-2.5 text-sm rounded-xl gap-2';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
