import React from 'react';
import { HelpCircle, Sparkles, BookOpen, Layers, Send, FileText } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Help Center & Documentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Everything you need to master CareerPilot's AI matching engine and ATS workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5 space-y-3 border-white/10">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">How AI Matching Works</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our match engine computes multi-attribute weighted scores: 50% required skills, 15% preferred skills, 15% experience, 10% education, and 10% career interests.
          </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-3 border-white/10">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">ATS Kanban Operations</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drag candidates across columns (Applied → Shortlisted → Interview → Selected) to update their status in real-time and trigger notification webhooks.
          </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-3 border-white/10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Skill Assessments & Roadmaps</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Complete timed skill assessments to earn verified badges that boost ranking in startup candidate searches.
          </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-3 border-white/10">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
            <Send className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Direct Sourcing & Invitations</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Startups can directly invite verified candidates for private or public job openings without manual resume parsing.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
