import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

interface RankingData {
  id: string;
  name: string;
  job: string;
  overallScore: number;
  skillsMatch: number;
  educationMatch: number;
  experienceMatch: number;
  rank: number;
}

const TrophyIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M21 5h-2M19 3v4m-5 4H10m4 0a4 4 0 01-8 0V5h12v4a4 4 0 01-4 4zM12 17v4m-3 0h6" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default function Ranking({ onViewDetails }: { onViewDetails: (id: string) => void }) {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Sorting states
  const [sortBy, setSortBy] = useState('Overall Score');
  const [jobFilter, setJobFilter] = useState('All Positions');

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('score')
        .select(`
          score_id,
          total_score,
          rank,
          application:application_id (
            application_id,
            candidate:candidate_id ( name ),
            job:job_id ( job_title )
          ),
          score_breakdown ( criteria, score_value )
        `);
        
      if (error) throw error;
      
      if (data) {
        const formattedData: RankingData[] = data.map((item: any, index: number) => {
          const breakdowns = item.score_breakdown || [];
          
          // Calculate skills match (sum of Mandatory and Optional)
          const mandatory = breakdowns.find((b: any) => b.criteria === 'Mandatory Requirements')?.score_value || 0;
          const optional = breakdowns.find((b: any) => b.criteria === 'Optional Requirements')?.score_value || 0;
          const skillsMatch = Math.round(Number(mandatory) + Number(optional));
          
          const educationMatch = Math.round(Number(breakdowns.find((b: any) => b.criteria === 'Education Match')?.score_value || 0));
          const experienceMatch = Math.round(Number(breakdowns.find((b: any) => b.criteria === 'Experience Match')?.score_value || 0));

          return {
            id: item.application?.application_id || item.score_id,
            name: item.application?.candidate?.name || 'Unknown',
            job: item.application?.job?.job_title || 'Unknown',
            overallScore: Math.round(item.total_score || 0),
            skillsMatch,
            educationMatch,
            experienceMatch,
            rank: item.rank || index + 1
          };
        });
        
        setRankings(formattedData);
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueJobs = useMemo(() => {
    const jobs = new Set(rankings.map(r => r.job));
    return ['All Positions', ...Array.from(jobs)];
  }, [rankings]);

  const sortedAndFilteredRankings = useMemo(() => {
    // First filter
    let filtered = rankings;
    if (jobFilter !== 'All Positions') {
      filtered = filtered.filter(r => r.job === jobFilter);
    }

    // Then sort
    return filtered.sort((a, b) => {
      if (sortBy === 'Overall Score') return b.overallScore - a.overallScore;
      if (sortBy === 'Skills Match') return b.skillsMatch - a.skillsMatch;
      if (sortBy === 'Experience Match') return b.experienceMatch - a.experienceMatch;
      return b.overallScore - a.overallScore; // default
    }).map((item, index) => ({ ...item, rank: index + 1 })); // recalculate rank after filtering/sorting
  }, [rankings, jobFilter, sortBy]);

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-6xl mx-auto xl:mx-0">
        
        {/* Header */}
        <header className="mb-10 text-left">
          <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Candidate Ranking</h1>
          <p className="text-slate-500 text-[15px]">AI-powered candidate scoring and ranking</p>
        </header>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 flex gap-8">
          <div className="flex-1 text-left">
            <label className="block text-xs font-semibold text-slate-500 mb-2">Sort By</label>
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 transition-colors cursor-pointer"
              >
                <option>Overall Score</option>
                <option>Skills Match</option>
                <option>Experience Match</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-left">
            <label className="block text-xs font-semibold text-slate-500 mb-2">Filter by Job</label>
            <div className="relative">
              <select 
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 transition-colors cursor-pointer"
              >
                {uniqueJobs.map(job => (
                  <option key={job}>{job}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-6 relative min-h-[200px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa]/50 z-10">
              <svg className="w-8 h-8 animate-spin text-[#1d4ed8]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : sortedAndFilteredRankings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No ranked candidates found matching your filters.</div>
          ) : (
            sortedAndFilteredRankings.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm relative overflow-hidden flex flex-col text-left">
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-5 flex-shrink-0 ${
                      candidate.rank === 1 ? 'bg-amber-500' : 
                      candidate.rank === 2 ? 'bg-slate-400' : 
                      candidate.rank === 3 ? 'bg-orange-500' :
                      'bg-slate-200 text-slate-600 font-bold'
                    }`}>
                      {candidate.rank <= 3 ? <TrophyIcon /> : <span>{candidate.rank}</span>}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#0f172a]">{candidate.name}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{candidate.job}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-serif font-bold leading-none ${
                      candidate.overallScore >= 90 ? 'text-[#16a34a]' : 'text-[#3b82f6]'
                    }`}>
                      {candidate.overallScore}%
                    </div>
                    <div className="text-slate-400 text-xs mt-1 font-medium">Overall Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Skills Match */}
                  <div>
                    <div className="flex justify-between text-[13px] font-semibold text-slate-700 mb-2">
                      <span>Skills Match</span>
                      <span>{candidate.skillsMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-[#1e293b] h-2.5 rounded-full" style={{ width: `${candidate.skillsMatch}%` }}></div>
                    </div>
                  </div>

                  {/* Education Match */}
                  <div>
                    <div className="flex justify-between text-[13px] font-semibold text-slate-700 mb-2">
                      <span>Education Match</span>
                      <span>{candidate.educationMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-[#1e293b] h-2.5 rounded-full" style={{ width: `${candidate.educationMatch}%` }}></div>
                    </div>
                  </div>

                  {/* Experience Match */}
                  <div>
                    <div className="flex justify-between text-[13px] font-semibold text-slate-700 mb-2">
                      <span>Experience Match</span>
                      <span>{candidate.experienceMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-[#1e293b] h-2.5 rounded-full" style={{ width: `${candidate.experienceMatch}%` }}></div>
                    </div>
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => onViewDetails(candidate.id)}
                    className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="mr-2 text-slate-400"><EyeIcon /></span> View Details
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
