import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Target, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { CareerRoadmap, SkillGapAnalysis } from '../../types';
import { careerApi } from '../../api/careerApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { RoadmapTimeline } from '../../components/career/RoadmapTimeline';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { useToast } from '../../context/ToastContext';

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
];

export const CareerDevelopmentPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchCareerData = async (role: string) => {
    setIsLoading(true);
    try {
      const [gapRes, roadRes] = await Promise.all([
        careerApi.getSkillGap(role),
        careerApi.getRoadmap(role),
      ]);

      if (gapRes.success && gapRes.data) {
        setSkillGap(gapRes.data);
      }
      if (roadRes.success && roadRes.data) {
        setRoadmap(roadRes.data);
      }
    } catch (err) {
      toastError('Error', 'Could not load career development roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerData(selectedRole);
  }, [selectedRole]);

  const handleSetGoal = async () => {
    try {
      await careerApi.setGoal(selectedRole);
      success('Career Goal Active', `Target role set to ${selectedRole}`);
      fetchCareerData(selectedRole);
    } catch (err) {
      toastError('Goal Error', 'Could not set active career goal.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-[11px] font-bold text-violet-300 mb-2">
          <span>✦ Career Intelligence & Upskilling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Career Development & Skill-Gap Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Bridge your knowledge gap with personalized milestone roadmaps tailored to startup hiring benchmarks.
        </p>
      </div>

      {/* Role Selector & Target Goal */}
      <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Target Engineering Goal</h3>
            <p className="text-xs text-slate-400">Select target role to recompute roadmap requirements</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="glass-input rounded-xl px-4 py-2 text-xs font-semibold text-slate-100 cursor-pointer"
          >
            {TARGET_ROLES.map((r) => (
              <option key={r} value={r} className="bg-slate-900">
                {r}
              </option>
            ))}
          </select>

          <Button variant="ai" size="sm" onClick={handleSetGoal}>
            Set Active Goal
          </Button>
        </div>
      </GlassCard>

      {isLoading ? (
        <LoadingScreen message="Calculating your skill-gap roadmap..." />
      ) : (
        <>
          {/* Readiness Score & Gap Breakdown */}
          {skillGap && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Readiness Score */}
              <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Role Readiness Score
                </span>
                <div className="relative w-28 h-28 flex items-center justify-center my-2">
                  <svg className="w-28 h-28 -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-slate-800" strokeWidth="8" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-violet-400 transition-all duration-700"
                      strokeWidth="8"
                      strokeDasharray="301.6"
                      strokeDashoffset={301.6 - (301.6 * skillGap.readinessScore) / 100}
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-2xl font-extrabold font-mono text-slate-100">
                    {skillGap.readinessScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 font-medium">
                  {skillGap.readinessScore >= 80 ? 'Hireable for Entry Level' : 'Upskilling in Progress'}
                </p>
              </GlassCard>

              {/* Possessed vs Missing */}
              <GlassCard className="p-6 md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Benchmark Skill Gap Breakdown
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Possessed Core Skills ({skillGap.possessedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGap.possessedSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Critical Missing Skills ({skillGap.missingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGap.missingSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic pt-2">
                  {skillGap.recommendationSummary}
                </p>
              </GlassCard>
            </div>
          )}

          {/* Interactive Learning Roadmap Timeline */}
          {roadmap && roadmap.roadmap && (
            <div className="space-y-4 pt-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Personalized Learning Roadmap</h2>
                <p className="text-xs text-slate-400">Step-by-step milestones to achieve 100% role readiness</p>
              </div>

              <RoadmapTimeline steps={roadmap.roadmap} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
