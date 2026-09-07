import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-white/5 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer',
              isActive ? 'text-sky-300 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-sky-500/15 border border-sky-500/30 rounded-lg -z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.icon && <span className="relative z-10">{tab.icon}</span>}
            <span className="relative z-10">{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'relative z-10 px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive ? 'bg-sky-400/20 text-sky-200' : 'bg-slate-800 text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
