import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles, Filter } from 'lucide-react';
import { Job, MatchAnalysis, FresherProfile } from '../../types';
import { jobApi } from '../../api/jobApi';
import { matchingApi } from '../../api/matchingApi';
import { profileApi } from '../../api/profileApi';
import { applicationApi } from '../../api/applicationApi';
import { JobCard } from '../../components/jobs/JobCard';
import { JobDetailView } from '../../components/jobs/JobDetailView';
import { JobFilterBar } from '../../components/jobs/JobFilterBar';
import { ApplyJobModal } from '../../components/jobs/ApplyJobModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export const JobDiscoveryPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [profile, setProfile] = useState<FresherProfile | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [matchesMap, setMatchesMap] = useState<Record<string, MatchAnalysis>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, profileRes, myAppsRes, matchRes] = await Promise.allSettled([
        jobApi.search({
          search: search || undefined,
          workMode: workMode || undefined,
          location: location || undefined,
          experience: experience || undefined,
        }),
        profileApi.getProfile(),
        applicationApi.getMyApplications(),
        matchingApi.getMatchedJobs(50),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
        const fetchedJobs = jobsRes.value.data || [];
        setJobs(fetchedJobs);
        if (fetchedJobs.length > 0 && !selectedJob) {
          setSelectedJob(fetchedJobs[0]);
        }
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.data);
      }

      if (myAppsRes.status === 'fulfilled' && myAppsRes.value.success) {
        const applied = new Set<string>();
        myAppsRes.value.data?.forEach((app: any) => {
          if (app.job?._id) applied.add(app.job._id);
        });
        setAppliedJobIds(applied);
      }

      if (matchRes.status === 'fulfilled' && matchRes.value.success) {
        const map: Record<string, MatchAnalysis> = {};
        matchRes.value.data?.forEach((m: any) => {
          const jobId = m.job?._id || m.job?.id;
          if (jobId) {
            map[jobId] = m;
          }
        });
        setMatchesMap(map);
      }
    } catch (err) {
      console.warn('Jobs fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, experience]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, location]);

  const handleResetFilters = () => {
    setSearch('');
    setWorkMode('');
    setLocation('');
    setExperience('');
  };

  const selectedMatch = selectedJob ? matchesMap[selectedJob._id] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Job Discovery & AI Sourcing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore startup positions with instant CareerPilot match compatibility scores.
        </p>
      </div>

      {/* Filter Bar */}
      <JobFilterBar
        search={search}
        onSearchChange={setSearch}
        workMode={workMode}
        onWorkModeChange={setWorkMode}
        location={location}
        onLocationChange={setLocation}
        experience={experience}
        onExperienceChange={setExperience}
        onReset={handleResetFilters}
      />

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[800px] overflow-y-auto pr-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-6 h-6" />}
              title="No Jobs Found"
              description="No matching positions found with the selected criteria. Try adjusting your filters."
              actionLabel="Clear Filters"
              onAction={handleResetFilters}
            />
          ) : (
            jobs.map((job) => {
              const match = matchesMap[job._id];
              return (
                <JobCard
                  key={job._id}
                  job={job}
                  isSelected={selectedJob?._id === job._id}
                  matchScore={match?.matchScore}
                  onClick={() => setSelectedJob(job)}
                />
              );
            })
          )}
        </div>

        {/* Right Column: Sticky Job Detail View */}
        <div className="lg:col-span-7 sticky top-20">
          {selectedJob ? (
            <JobDetailView
              job={selectedJob}
              matchAnalysis={selectedMatch}
              hasApplied={appliedJobIds.has(selectedJob._id)}
              onApply={() => setIsApplyModalOpen(true)}
            />
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              Select a job on the left to view detailed requirements and AI match analysis.
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyJobModal
        job={selectedJob}
        profile={profile}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          if (selectedJob) {
            setAppliedJobIds((prev) => new Set(prev).add(selectedJob._id));
          }
        }}
      />
    </div>
  );
};
