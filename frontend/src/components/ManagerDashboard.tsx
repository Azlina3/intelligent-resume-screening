import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import ProfileSettings from './ProfileSettings';
import Jobs from './Jobs';
import Candidates from './Candidates';
import Ranking from './Ranking';
import CandidateDetails from './CandidateDetails';
import { formatTimeAgo, getActionTypeColor } from '../utils/dateUtils';

// Icon components
const BriefcaseIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);



const ManagerViewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MenuBriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default function ManagerDashboard({ userName, departmentId, departmentName }: { userName?: string, departmentId?: number | null, departmentName?: string }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'jobs' | 'candidates' | 'ranking' | 'candidate-details'>('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedJobForRanking, setSelectedJobForRanking] = useState<string>('All Positions');
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<string | null>(null);
  
  // Dashboard Data States
  const [departmentActivities, setDepartmentActivities] = useState<any[]>([]);
  const [candidatesAwaitingReview, setCandidatesAwaitingReview] = useState<number>(0);
  const [openRolesCount, setOpenRolesCount] = useState<number>(0);
  const [openRolesList, setOpenRolesList] = useState<string>('');
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentView === 'dashboard' && departmentId) {
      fetchDashboardData();
    }
  }, [currentView, departmentId]);

  const fetchDashboardData = async () => {
    setIsDashboardLoading(true);
    try {
      // 1. Fetch Department Activities
      const { data: activitiesData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('department_id', departmentId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setDepartmentActivities(activitiesData || []);

      // 2. Fetch Open Roles
      const { data: rolesData } = await supabase
        .from('job')
        .select('job_title')
        .eq('department_id', departmentId)
        .eq('job_status', 'active');
        
      if (rolesData) {
        setOpenRolesCount(rolesData.length);
        const uniqueTitles = Array.from(new Set(rolesData.map(r => r.job_title)));
        setOpenRolesList(uniqueTitles.join(', '));
      }

      // 3. Fetch Active Applications & Compute Ranking
      const { data: scoreData } = await supabase
        .from('score')
        .select(`
          score_id,
          total_score,
          rank,
          application:application_id!inner (
            application_id,
            application_status,
            candidate:candidate_id ( name ),
            job:job_id!inner ( job_title, department_id, job_status )
          ),
          score_breakdown ( criteria, score_value )
        `)
        .eq('application.job.department_id', departmentId)
        .eq('application.job.job_status', 'active');

      if (scoreData) {
        // Show fresh candidates that haven't been reviewed by anyone yet
        const activeCandidates = scoreData.filter((item: any) => 
          item.application?.application_status === 'Received'
        );

        setCandidatesAwaitingReview(activeCandidates.length);

        const formattedCandidates = activeCandidates.map((item: any, index: number) => {
          const breakdowns = item.score_breakdown || [];
          
          const skillsBreakdowns = breakdowns.filter((b: any) => 
            b.criteria !== 'Education Match' && b.criteria !== 'Experience Match' && b.criteria !== 'Mandatory Requirements' && b.criteria !== 'Optional Requirements'
          );
          
          let skillsMatchPoints = 0;
          if (skillsBreakdowns.length > 0) {
            skillsMatchPoints = skillsBreakdowns.reduce((sum: number, b: any) => sum + Number(b.score_value || 0), 0);
          } else {
            const mandatory = Number(breakdowns.find((b: any) => b.criteria === 'Mandatory Requirements')?.score_value || 0);
            const optional = Number(breakdowns.find((b: any) => b.criteria === 'Optional Requirements')?.score_value || 0);
            skillsMatchPoints = mandatory + optional;
          }

          const rawEdu = Number(breakdowns.find((b: any) => b.criteria === 'Education Match')?.score_value || 0);
          const rawExp = Number(breakdowns.find((b: any) => b.criteria === 'Experience Match')?.score_value || 0);
          
          const totalScore = item.total_score || 0;
          const candidatePointsEarned = skillsMatchPoints + rawEdu + rawExp;
          
          let maxPossiblePoints = 100;
          if (totalScore > 0 && candidatePointsEarned > 0) {
             maxPossiblePoints = (candidatePointsEarned / totalScore) * 100;
          }
          
          const maxSkillsPoints = Math.max(1, maxPossiblePoints - 20);
          const skillsMatch = Math.min(100, Math.round((skillsMatchPoints / maxSkillsPoints) * 100));

          return {
            id: item.application?.application_id,
            name: item.application?.candidate?.name || 'Unknown',
            job_title: item.application?.job?.job_title || 'Unknown',
            status: item.application?.application_status,
            overallScore: Math.round(item.total_score || 0),
            skillsMatch,
            originalRank: item.rank || index + 1
          };
        });

        // Sort by overallScore (descending) and take top 5
        formattedCandidates.sort((a, b) => b.overallScore - a.overallScore);
        
        // Re-assign display ranks based on sorting
        const rankedCandidates = formattedCandidates.slice(0, 5).map((c, i) => ({ ...c, displayRank: i + 1 }));
        setTopCandidates(rankedCandidates);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar - Consistent with HRDashboard but Manager View active */}
      <aside className="w-[280px] bg-[#1e293b] text-white flex flex-col flex-shrink-0">
        <div className="p-8 pb-4 text-left">
          <h2 className="text-[22px] font-serif font-bold tracking-wide">TalentScreen</h2>
          <p className="text-slate-400 text-xs mt-1">Intelligent Hiring</p>
        </div>
        
        <nav className="flex-1 mt-6">
          <ul className="space-y-2">

            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'dashboard' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60">
                  <ManagerViewIcon />
                </span>
                <span className="text-[15px]">Manager View</span>
              </a>
            </li>
            {[
              { name: 'Jobs', icon: <MenuBriefcaseIcon /> },
              { name: 'Ranking', icon: <ChartBarIcon /> },
              { name: 'Candidates', icon: <UsersIcon /> }
            ].map((item) => {
              const viewName = item.name.toLowerCase() as typeof currentView;
              return (
              <li key={item.name}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentView(viewName); }}
                  className={`flex items-center px-8 py-2.5 transition-colors ${currentView === viewName ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
                >
                  <span className="mr-3 opacity-60">
                    {item.icon}
                  </span>
                  <span className="text-[15px]">{item.name}</span>
                </a>
              </li>
              );
            })}
          </ul>
        </nav>

        <div className="py-8 border-t border-slate-700/50">
          <ul className="space-y-4 text-left">
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'settings' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60">⚙️</span>
                <span className="text-[15px]">Profile Settings</span>
              </a>
            </li>
            <li>
              <button onClick={handleLogout} className="flex items-center w-full px-8 text-slate-300 hover:text-white text-[15px] text-left">
                <span className="mr-3 opacity-60">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      {(() => {
        if (currentView === 'dashboard') {
          return (
            <main className="flex-1 p-10 px-12 overflow-y-auto">
        <header className="mb-10 text-left">
          <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Welcome back, {userName || 'Manager'}</h1>
          <p className="text-slate-500 text-[15px]">Scope restricted to: {departmentName || 'Your'} Department.</p>
        </header>

        {/* Top Layout Metrics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Candidates Awaiting Review */}
          <div className="bg-white rounded-xl border border-orange-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Candidates Awaiting Your Review</span>
              <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100">
                <AlertIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-[#ea580c] mb-1 leading-none">{isDashboardLoading ? '-' : candidatesAwaitingReview}</div>
          </div>

          {/* Card 2: Open Engineering Roles */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Open Roles</span>
              <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                <BriefcaseIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-[#1a56db] mb-5 leading-none">{isDashboardLoading ? '-' : openRolesCount}</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px] truncate">{openRolesList || 'No active roles'}</p>
            </div>
          </div>

          {/* Card 3: Ranking Engine */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">System Ranking Engine</span>
              <div className="p-2 bg-green-50/50 rounded-lg border border-green-100">
                <CheckCircleIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-green-600 mb-5 leading-none">Complete</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px]">All resume matches calculated</p>
            </div>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Side: Data Table Component (Spans 2 columns) */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm text-left overflow-hidden flex flex-col h-full">
              <div className="p-8 pb-6 border-b border-slate-100">
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-1">Awaiting Your Judgment</h3>
                <p className="text-slate-500 text-[14px]">Fresh candidates that have not been reviewed yet</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="py-4 px-8 text-[13px] font-bold text-slate-600">Candidate Name</th>
                      <th className="py-4 px-4 text-[13px] font-bold text-slate-600">Target Role</th>
                      <th className="py-4 px-4 text-[13px] font-bold text-slate-600">Screening Rank</th>
                      <th className="py-4 px-4 text-[13px] font-bold text-slate-600">Match Score</th>
                      <th className="py-4 px-8 text-[13px] font-bold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    
                    {isDashboardLoading ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading...</td></tr>
                    ) : topCandidates.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500">No active candidates found.</td></tr>
                    ) : (
                      topCandidates.map((candidate, index) => (
                        <tr key={candidate.id || index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-semibold text-slate-800 text-[15px]">{candidate.name}</td>
                          <td className="py-5 px-4 text-slate-500 text-[14px]">{candidate.job_title}</td>
                          <td className="py-5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold border ${
                              candidate.displayRank === 1 ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                              candidate.displayRank === 2 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                              'bg-orange-100 text-orange-800 border-orange-200'
                            }`}>
                              Rank #{candidate.displayRank}
                            </span>
                          </td>
                          <td className="py-5 px-4 font-bold text-emerald-600">{candidate.overallScore}%</td>
                          <td className="py-5 px-8">
                            <button 
                              onClick={() => { setSelectedApplicationId(candidate.id); setCurrentView('candidate-details'); }}
                              className="bg-[#1a56db] hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              Review Resume
                            </button>
                          </td>
                        </tr>
                      ))
                    )}

                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Side: Department Activity Stream */}
          <div className="xl:col-span-1 flex flex-col gap-8">
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left h-full">
              <h3 className="text-xl font-serif font-bold text-slate-800 mb-8">Department Activity Stream</h3>
              
              <div className="space-y-7 border-l-2 border-slate-100 ml-2 pl-6">
                
                {departmentActivities.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">No recent activity for your department.</p>
                ) : (
                  departmentActivities.map((activity, index) => (
                    <div key={activity.log_id || index} className="relative">
                      <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full ${getActionTypeColor(activity.action_type)} ring-4 ring-white`}></div>
                      <div className="flex flex-col">
                        <div className="font-semibold text-slate-800 text-[14px] leading-snug">
                          {activity.action_headline}
                        </div>
                        <div className="text-slate-500 text-[13px] mt-0.5">
                          {activity.action_detail}
                        </div>
                        <div className="text-slate-400 text-[12px] flex items-center mt-1.5">
                          <span className="mr-1">🕒</span> {formatTimeAgo(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
              </div>
            </section>
          </div>
          
        </div>
      </main>
      );
      } else if (currentView === 'jobs') {
        return <Jobs 
          departmentFilterId={departmentId} 
          onViewRanking={(jobTitle) => {
            setSelectedJobForRanking(jobTitle || 'All Positions');
            setCurrentView('ranking');
          }}
        />;
      } else if (currentView === 'candidates') {
        return <Candidates 
          departmentFilterId={departmentId} 
          onViewInRanking={(id, jobTitle) => {
            setHighlightedCandidateId(id);
            setSelectedJobForRanking(jobTitle);
            setCurrentView('ranking');
          }}
        />;
      } else if (currentView === 'ranking') {
        return <Ranking 
          departmentFilterId={departmentId} 
          onViewDetails={(id) => { setSelectedApplicationId(id); setCurrentView('candidate-details'); }}
          initialJobFilter={selectedJobForRanking}
          highlightedCandidateId={highlightedCandidateId}
        />;
      } else if (currentView === 'candidate-details' && selectedApplicationId) {
        return <CandidateDetails 
          applicationId={selectedApplicationId} 
          onBack={() => setCurrentView('ranking')} 
        />;
      } else if (currentView === 'settings') {
        return <ProfileSettings userName={userName} />;
      } else {
        return (
          <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
            <div className="max-w-4xl mx-auto flex items-center justify-center h-full">
              <p className="text-slate-500 text-lg">The {currentView} view is coming soon.</p>
            </div>
          </main>
        );
      }
    })()}
    </div>
  );
}
