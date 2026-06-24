import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

interface CandidateData {
  id: string;
  name: string;
  email: string;
  job: string;
  jobStatus: string;
  status: string;
  match: number;
}

export default function Candidates({ onViewInRanking, departmentFilterId }: { onViewInRanking?: (applicationId: string, jobTitle: string) => void, departmentFilterId?: number | null }) {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [jobFilter, setJobFilter] = useState('All Jobs');
  const [activeTab, setActiveTab] = useState<'Active' | 'Historical'>('Active');

  useEffect(() => {
    setJobFilter('All Jobs');
    setStatusFilter('All Statuses');
  }, [activeTab]);
  
  useEffect(() => {
    fetchCandidates();
  }, [departmentFilterId]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('application')
        .select(`
          application_id,
          application_status,
          candidate:candidate_id ( name, email ),
          job:job_id!inner ( job_id, job_title, department_id, job_status ),
          score ( total_score )
        `);
        
      if (departmentFilterId) {
        query = query.eq('job.department_id', departmentFilterId);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      if (data) {
        const formattedData: CandidateData[] = data.map((app: any) => {
          const scoreObj = Array.isArray(app.score) ? app.score[0] : app.score;
          const matchScore = scoreObj?.total_score;
          
          return {
            id: app.application_id,
            name: app.candidate?.name || 'Unknown',
            email: app.candidate?.email || 'Unknown',
            job: app.job?.job_title ? `${app.job.job_title} (ID: ${app.job.job_id})` : 'Unknown',
            jobStatus: app.job?.job_status || 'closed',
            status: app.application_status || 'Received',
            match: matchScore != null ? Math.round(Number(matchScore)) : 0
          };
        });
        setCandidates(formattedData);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique jobs for the dropdown
  const uniqueJobs = useMemo(() => {
    const relevantCandidates = candidates.filter(c => activeTab === 'Active' ? c.jobStatus === 'active' : c.jobStatus !== 'active');
    const jobs = new Set(relevantCandidates.map(c => c.job));
    return ['All Jobs', ...Array.from(jobs)];
  }, [candidates, activeTab]);

  // Status counts for quick filters
  const statusCounts = useMemo(() => {
    const relevantCandidates = candidates.filter(c => activeTab === 'Active' ? c.jobStatus === 'active' : c.jobStatus !== 'active');
    const counts = { received: 0, underReview: 0, shortlisted: 0, onHold: 0, successful: 0, unsuccessful: 0 };
    relevantCandidates.forEach(c => {
      if (c.status === 'Received') counts.received++;
      else if (c.status === 'Under Review') counts.underReview++;
      else if (c.status === 'Shortlisted') counts.shortlisted++;
      else if (c.status === 'On Hold') counts.onHold++;
      else if (c.status === 'Successful') counts.successful++;
      else if (c.status === 'Unsuccessful') counts.unsuccessful++;
    });
    return counts;
  }, [candidates, activeTab]);

  // Filter the candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesTab = activeTab === 'Active' ? c.jobStatus === 'active' : c.jobStatus !== 'active';
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All Statuses' || c.status === statusFilter;
      const matchesJob = jobFilter === 'All Jobs' || c.job === jobFilter;
      return matchesTab && matchesSearch && matchesStatus && matchesJob;
    }).sort((a, b) => b.match - a.match); // sort by match descending
  }, [candidates, searchQuery, statusFilter, jobFilter, activeTab]);

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-6xl mx-auto xl:mx-0">
        
        {/* Header */}
        <header className="mb-8 text-left">
          <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Candidates</h1>
          <p className="text-slate-500 text-[15px]">{filteredCandidates.length} applicants in current view</p>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8 text-sm text-left">
          <button 
            onClick={() => setActiveTab('Active')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'Active' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            Active Hiring
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {candidates.filter(c => c.jobStatus === 'active').length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('Historical')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'Historical' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            Historical Records
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {candidates.filter(c => c.jobStatus !== 'active').length}
            </span>
          </button>
        </div>

        {/* Controls Row */}
        <div className="mb-6">
          <div className="relative w-full md:w-96 border border-slate-200 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 focus-within:border-[#1d4ed8] transition-colors">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search candidates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-none bg-transparent text-sm focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400 rounded-lg"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStatusFilter('Received')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'Received' ? 'bg-[#1d4ed8] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs font-semibold transition-colors`}>Received ({statusCounts.received})</button>
            <button onClick={() => setStatusFilter('Under Review')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'Under Review' ? 'bg-[#1d4ed8] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs font-semibold transition-colors`}>Under Review ({statusCounts.underReview})</button>
            <button onClick={() => setStatusFilter('Shortlisted')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'Shortlisted' ? 'bg-[#1d4ed8] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs font-semibold transition-colors`}>Shortlisted ({statusCounts.shortlisted})</button>
            <button onClick={() => setStatusFilter('On Hold')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'On Hold' ? 'bg-[#1d4ed8] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs font-semibold transition-colors`}>On Hold ({statusCounts.onHold})</button>
            <button onClick={() => setStatusFilter('Successful')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'Successful' ? 'bg-[#1d4ed8] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs font-semibold transition-colors`}>Successful ({statusCounts.successful})</button>
            <button onClick={() => setStatusFilter('Unsuccessful')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'Unsuccessful' ? 'bg-[#1d4ed8] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs font-semibold transition-colors`}>Unsuccessful ({statusCounts.unsuccessful})</button>
            {statusFilter !== 'All Statuses' && (
              <button onClick={() => setStatusFilter('All Statuses')} className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-600 text-xs font-semibold transition-colors">Clear</button>
            )}
          </div>
          
          <div className="relative flex-shrink-0">
            <select 
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-64 pl-4 pr-10 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] cursor-pointer font-medium truncate"
            >
              {uniqueJobs.map(job => (
                <option key={job}>{job}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 text-left">
            <div className="col-span-4 pl-2">Candidate</div>
            <div className="col-span-4">Job</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Match</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100 relative min-h-[200px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <svg className="w-8 h-8 animate-spin text-[#1d4ed8]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No candidates found matching your filters.</div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div 
                  key={candidate.id} 
                  onClick={() => onViewInRanking && onViewInRanking(candidate.id, candidate.job)}
                  className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-50/50 transition-colors text-left cursor-pointer group"
                >
                  <div className="col-span-4 pl-2">
                    <div className="font-semibold text-slate-800 text-[15px]">{candidate.name}</div>
                    <div className="text-slate-500 text-sm">{candidate.email}</div>
                  </div>
                  <div className="col-span-4 text-slate-600 text-[14px]">
                    {candidate.job}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border-2 ${
                      candidate.status === 'Received' ? 'bg-blue-50 text-blue-700 border-blue-500' :
                      candidate.status === 'Under Review' ? 'bg-purple-50 text-purple-700 border-purple-500' :
                      candidate.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' :
                      candidate.status === 'On Hold' ? 'bg-orange-50 text-orange-700 border-orange-500' :
                      candidate.status === 'Successful' ? 'bg-green-50 text-green-700 border-green-500' :
                      candidate.status === 'Unsuccessful' ? 'bg-red-50 text-red-700 border-red-500' :
                      'bg-slate-50 text-slate-700 border-slate-500'
                    }`}>
                      {candidate.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center pr-4">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mr-3">
                      <div 
                        className={`h-1.5 rounded-full ${candidate.match >= 80 ? 'bg-[#16a34a]' : candidate.match >= 60 ? 'bg-[#3b82f6]' : 'bg-slate-400'}`} 
                        style={{ width: `${candidate.match}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-semibold ${candidate.match >= 80 ? 'text-[#16a34a]' : candidate.match >= 60 ? 'text-[#3b82f6]' : 'text-slate-500'}`}>
                      {candidate.match}%
                    </span>
                    <svg className="w-4 h-4 ml-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
