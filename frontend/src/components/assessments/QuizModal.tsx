import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Award, AlertCircle, Sparkles } from 'lucide-react';
import { Assessment, AssessmentResult } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { assessmentApi } from '../../api/assessmentApi';
import { useToast } from '../../context/ToastContext';

interface QuizModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (res: AssessmentResult) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onCompleted,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (assessment && isOpen) {
      setCurrentIdx(0);
      setSelectedAnswers({});
      setResult(null);
      setTimeLeft((assessment.durationMinutes || 20) * 60);
    }
  }, [assessment, isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, result]);

  if (!assessment) return null;

  const currentQ = assessment.questions[currentIdx];
  const totalQuestions = assessment.questions.length;
  const isLastQuestion = currentIdx === totalQuestions - 1;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await assessmentApi.submit(assessment._id, answersPayload);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.isPassed) {
          success('Assessment Passed!', `You scored ${res.data.percentage}% and verified your ${assessment.skillName} credential.`);
        }
        onCompleted(res.data);
      }
    } catch (err: any) {
      toastError('Submission Error', err.response?.data?.message || 'Failed to score assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        result ? (
          'Assessment Results'
        ) : (
          <div className="flex items-center justify-between w-full pr-6">
            <span>{assessment.title}</span>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/15 px-2.5 py-1 rounded-lg border border-sky-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> {formatTimer(timeLeft)}
            </span>
          </div>
        )
      }
    >
      {result ? (
        /* Result Screen */
        <div className="text-center py-4 space-y-5">
          <div className="flex justify-center">
            {result.isPassed ? (
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-glow-primary">
                <Award className="w-10 h-10 animate-bounce" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {result.isPassed ? 'Assessment Passed! 🎉' : 'Keep Practicing'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {result.isPassed
                ? `You have demonstrated mastery in ${assessment.skillName}.`
                : `Passing threshold is ${result.passingScorePercentage}%. Review the recommended learning roadmap.`}
            </p>
          </div>

          {/* Score card */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
              <span className="text-base font-extrabold text-slate-100">{result.score} / {result.maxScore}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Percentage</span>
              <span className={`text-base font-extrabold ${result.isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {result.percentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <span className={`text-base font-extrabold ${result.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.isPassed ? 'PASSED' : 'RETAKE'}
              </span>
            </div>
          </div>

          <div className="pt-3">
            <Button variant="primary" size="md" onClick={onClose} className="w-full">
              Complete & Close
            </Button>
          </div>
        </div>
      ) : (
        /* Question Screen */
        <div className="space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
              <span>Question {currentIdx + 1} of {totalQuestions}</span>
              <span>{Math.round(((currentIdx + 1) / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-violet-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
              {currentQ.questionText}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswers[currentQ._id] === opt._id;
              return (
                <button
                  key={opt._id}
                  onClick={() => handleSelectOption(currentQ._id, opt._id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md ring-1 ring-sky-400/30'
                      : 'bg-slate-900/40 border-white/5 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'border-sky-400 bg-sky-500 text-slate-950'
                        : 'border-slate-600 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                type="button"
                variant="ai"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleSubmitQuiz}
              >
                Submit Assessment
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setCurrentIdx((prev) => prev + 1)}
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
