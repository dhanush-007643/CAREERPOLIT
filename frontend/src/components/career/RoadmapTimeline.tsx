import React from 'react';
import { CheckCircle2, Circle, Clock, BookOpen, Code, ExternalLink } from 'lucide-react';
import { RoadmapStep } from '../../types';
import { Badge } from '../ui/Badge';

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ steps }) => {
  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-sky-400 before:via-violet-500 before:to-emerald-400">
      {steps.map((step) => (
        <div key={step.stepNumber} className="relative group">
          {/* Timeline Node Icon */}
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#050816] border-2 border-sky-400 flex items-center justify-center -translate-x-1/2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg group-hover:border-sky-500/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Step {step.stepNumber}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-100">{step.title}</h4>
              </div>
              <Badge variant="neutral" size="sm" icon={<Clock className="w-3 h-3" />}>
                ~{step.estimatedWeeks} weeks
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3.5">{step.description}</p>

            {/* Target Skills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {step.targetSkills.map((sk) => (
                <span key={sk} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  ✦ {sk}
                </span>
              ))}
            </div>

            {/* Recommended Resources */}
            {step.recommendedResources && step.recommendedResources.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Curated Learning Resources
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {step.recommendedResources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between text-xs text-slate-200 transition-colors group/link"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {res.type === 'COURSE' ? (
                          <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        ) : (
                          <Code className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        )}
                        <span className="truncate">{res.title}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover/link:text-sky-300 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
