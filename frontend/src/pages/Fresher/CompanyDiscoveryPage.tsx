import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Company } from '../../types';
import { companyApi } from '../../api/companyApi';
import { CompanyCard } from '../../components/companies/CompanyCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export const CompanyDiscoveryPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const [companiesRes, followingRes] = await Promise.allSettled([
        companyApi.getAll({ search: search || undefined }),
        companyApi.getFollowing(),
      ]);

      const followingSet = new Set<string>();
      if (followingRes.status === 'fulfilled' && followingRes.value.success && followingRes.value.data) {
        const followingList = Array.isArray(followingRes.value.data) ? followingRes.value.data : [];
        followingList.forEach((item: any) => {
          const compId = item.company?._id || item.company || item._id;
          if (compId) followingSet.add(compId.toString());
        });
      }

      if (companiesRes.status === 'fulfilled' && companiesRes.value.success && companiesRes.value.data) {
        const rawCompanies = Array.isArray(companiesRes.value.data) ? companiesRes.value.data : [];
        const enriched = rawCompanies.map((c: any) => ({
          ...c,
          isFollowing: followingSet.has(c._id.toString()),
        }));
        setCompanies(enriched);
      }
    } catch (err) {
      console.warn('Companies fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Startup Ecosystem Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Follow high-growth startups to receive immediate job alerts when new positions open.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search startups by name, industry, tech stack..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Startups Found"
          description="Try broadening your search keywords or explore other industries."
        />
      )}
    </div>
  );
};
