import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { Assessment, AssessmentResult } from '../../types';
import { assessmentApi } from '../../api/assessmentApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { QuizModal } from '../../components/assessments/QuizModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const CATEGORIES = [
  { id: 'ALL', label: 'All Assessments' },
  { id: 'FULLSTACK', label: 'Full Stack' },
  { id: 'BACKEND', label: 'Backend' },
  { id: 'FRONTEND', label: 'Frontend' },
  { id: 'DEVOPS', label: 'DevOps & Cloud' },
];

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const res = await assessmentApi.getAll(activeCategory !== 'ALL' ? activeCategory : undefined);
      if (res.success && res.data) {
        setAssessments(res.data);
      }
    } catch (err) {
      console.warn('Assessments fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [activeCategory]);

  const handleStartAssessment = (a: Assessment) => {
    setSelectedAssessment(a);
    setIsQuizOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Verified Skill Assessments
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Take timed assessments to verify your skills and boost your match ranking with top startups.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs tabs={CATEGORIES} activeTab={activeCategory} onChange={setActiveCategory} />

      {/* Assessments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6" />}
          title="No Assessments Available"
          description="Check back soon for new skill tests in this category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map((item) => (
            <GlassCard key={item._id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="ai" size="sm">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {item.durationMinutes || 20} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description || 'Test and verify core competencies in this domain.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item.passingScorePercentage}% to pass
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => handleStartAssessment(item)}
                >
                  Start Quiz
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal
        assessment={selectedAssessment}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onCompleted={() => {
          fetchAssessments();
        }}
      />
    </div>
  );
};
