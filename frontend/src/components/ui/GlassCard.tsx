import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'ai' | 'hoverable' | 'subtle';
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'ai':
        return 'glass-card-ai';
      case 'hoverable':
        return 'glass-panel glass-panel-hover cursor-pointer';
      case 'subtle':
        return 'bg-slate-900/40 backdrop-blur-md border border-white/5';
      default:
        return 'glass-panel shadow-glass';
    }
  };

  return (
    <motion.div
      className={cn('rounded-2xl p-6 transition-all duration-300', getVariantStyles(), className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
