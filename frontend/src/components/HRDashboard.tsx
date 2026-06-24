import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import ProfileSettings from './ProfileSettings';
import Jobs from './Jobs';
import Candidates from './Candidates';
import Ranking from './Ranking';
import CandidateDetails from './CandidateDetails';
import EmailTemplates from '../pages/EmailTemplates';
import Templates from './Templates';
import { formatTimeAgo, getActionTypeColor } from '../utils/dateUtils';

// Icon components
const BriefcaseIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LayoutDashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function HRDashboard({ userName, userRole }: { userName?: string, userRole?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'jobs' | 'templates' | 'candidates' | 'ranking' | 'emails' | 'candidate-details'>(location.state?.currentView || 'dashboard');
  const [jobsExpanded, setJobsExpanded] = useState(location.state?.currentView === 'jobs' || location.state?.currentView === 'templates');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedJobForRanking, setSelectedJobForRanking] = useState<string>('All Positions');
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<string | null>(null);
  const [selectedCandidateForEmail, setSelectedCandidateForEmail] = useState<any>(null);

  const [dashboardStats, setDashboardStats] = useState({
    activePostings: 0,
    newApplications: 0,
    upcomingInterviews: 0
  });

  const [pipelineData, setPipelineData] = useState({
    newCount: 0,
    underReviewCount: 0,
    shortlistedCount: 0,
    rejectedCount: 0,
    successfulCount: 0,
    totalActive: 0
  });

  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchDashboardData();
    }
  }, [currentView, userRole]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Active Postings
      const { count: activeCount } = await supabase
        .from('job')
        .select('*', { count: 'exact', head: true })
        .eq('job_status', 'active');

      // 2. Fetch New Applications (Last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: newAppsCount } = await supabase
        .from('application')
        .select('*', { count: 'exact', head: true })
        .gte('applied_at', yesterday.toISOString());

      // 3. Fetch Upcoming Interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interview')
        .select(`
          interview_id,
          scheduled_at,
          location_or_link,
          application (
            candidate ( name ),
            job ( job_title )
          )
        `)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (interviewsError) {
        console.error("Error fetching interviews:", interviewsError);
      }

      setUpcomingInterviews(interviewsData || []);

      setDashboardStats({
        activePostings: activeCount || 0,
        newApplications: newAppsCount || 0,
        upcomingInterviews: interviewsData?.length || 0
      });

      // 4. Fetch Pipeline Data
      const { data: appsData } = await supabase
        .from('application')
        .select('application_status');

      if (appsData) {
        let newCount = 0;
        let underReviewCount = 0;
        let shortlistedCount = 0;
        let rejectedCount = 0;
        let successfulCount = 0;

        appsData.forEach(app => {
          if (app.application_status === 'Received') newCount++;
          else if (app.application_status === 'Under Review') underReviewCount++;
          else if (app.application_status === 'Shortlisted') shortlistedCount++;
          else if (app.application_status === 'Unsuccessful') rejectedCount++;
          else if (app.application_status === 'Successful') successfulCount++;
        });

        setPipelineData({
          newCount,
          underReviewCount,
          shortlistedCount,
          rejectedCount,
          successfulCount,
          totalActive: newCount + underReviewCount + shortlistedCount + successfulCount
        });
      }

      // 5. Fetch Urgent Action Items (Jobs pending approval or draft)
      if (userRole === 'hr_senior') {
        const { data: pendingJobs } = await supabase
          .from('job')
          .select('job_id, job_title')
          .eq('job_status', 'pending_approval');
        setActionItems(pendingJobs || []);
      } else if (userRole === 'hr_junior') {
        const { data: draftJobs } = await supabase
          .from('job')
          .select('job_id, job_title')
          .eq('job_status', 'draft');
        setActionItems(draftJobs || []);
      }

      // 6. Fetch Recent Activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
      } else {
        setRecentActivities(activitiesData || []);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar - Replicating exact design from screenshot */}
      <aside className="w-[280px] bg-[#1e293b] text-white flex flex-col flex-shrink-0">
        <div className="p-8 pb-4">
          <h2 className="text-[22px] font-serif font-bold tracking-wide">TalentScreen</h2>
          <p className="text-slate-400 text-xs mt-1">Intelligent Hiring</p>
        </div>

        <nav className="flex-1 mt-6">
          <ul className="space-y-2">
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); setJobsExpanded(false); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'dashboard' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60">
                  <LayoutDashboardIcon />
                </span>
                <span className="text-[15px]">HR Dashboard</span>
              </a>
            </li>
            {[
              { name: 'Jobs', icon: <MenuBriefcaseIcon />, hasSubmenu: true },
              { name: 'Ranking', icon: <ChartBarIcon /> },
              { name: 'Candidates', icon: <UsersIcon /> },
              { name: 'Emails', icon: <MailIcon /> }
            ].map((item) => {
              const viewName = item.name.toLowerCase() as typeof currentView;
              const isJobsMenu = item.name === 'Jobs';
              const isJobsActive = currentView === 'jobs' || currentView === 'templates';
              
              return (
              <li key={item.name} className="flex flex-col">
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (isJobsMenu) {
                      setJobsExpanded(!jobsExpanded);
                      if (currentView !== 'jobs' && currentView !== 'templates') {
                        setCurrentView('jobs');
                      }
                    } else {
                      setCurrentView(viewName); 
                      setJobsExpanded(false);
                      if (viewName !== 'ranking') {
                        setSelectedJobForRanking('All Positions');
                      }
                    }
                  }}
                  className={`flex items-center px-8 py-2.5 transition-colors justify-between ${currentView === viewName || (isJobsMenu && isJobsActive) ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 opacity-60">
                      {item.icon}
                    </span>
                    <span className="text-[15px]">{item.name}</span>
                  </div>
                  {isJobsMenu && (
                    <svg className={`w-4 h-4 transition-transform ${jobsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  )}
                </a>
                
                {isJobsMenu && jobsExpanded && (
                  <ul className="bg-slate-800/50 py-2 space-y-1">
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('jobs'); }} className={`flex items-center pl-[52px] pr-8 py-2 transition-colors text-[14px] ${currentView === 'jobs' ? 'text-white font-medium' : 'text-slate-400 hover:text-white'}`}>All Jobs</a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('templates'); }} className={`flex items-center pl-[52px] pr-8 py-2 transition-colors text-[14px] ${currentView === 'templates' ? 'text-white font-medium' : 'text-slate-400 hover:text-white'}`}>Templates</a>
                    </li>
                  </ul>
                )}
              </li>
              );
            })}
          </ul>
        </nav>

        <div className="py-8 border-t border-slate-700/50">
          <ul className="space-y-4">
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('settings'); setJobsExpanded(false); }}
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
      {currentView === 'dashboard' ? (
      <main className="flex-1 p-10 px-12 overflow-y-auto">
        <header className="mb-10 text-left">
          <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Welcome back, {userName || 'Aida'}</h1>
          <p className="text-slate-500 text-[15px]">Here is your recruitment overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
        </header>

        {/* 1. Top Row of Metric Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Active Postings */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Active Postings</span>
              <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                <BriefcaseIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-[#1a56db] mb-5 leading-none">{dashboardStats.activePostings}</div>
            <div className="mt-auto pt-4 border-t border-slate-50/0">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('jobs'); }}
                className="text-[#1a56db] text-sm font-medium hover:underline flex items-center"
              >
                Manage jobs <span className="ml-1 text-lg leading-none">→</span>
              </a>
            </div>
          </div>

          {/* Card 2: New Applications */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">New Applications</span>
              <div className="p-2 bg-green-50/50 rounded-lg border border-green-100">
                <TrendingUpIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-green-600 mb-5 leading-none">+{dashboardStats.newApplications}</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px]">Received since your login yesterday</p>
            </div>
          </div>

          {/* Card 3: Upcoming Interviews */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Upcoming Interviews</span>
              <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                <ClockIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-purple-600 mb-5 leading-none">{dashboardStats.upcomingInterviews}</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px]">Scheduled upcoming</p>
            </div>
          </div>
        </div>

        {/* 2. Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Left Side Container */}
          <div className="flex flex-col gap-8">
            {/* Action Required Box */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left border-l-4 border-l-orange-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-orange-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </span>
                  {userRole === 'hr_senior' ? 'Pending Job Approvals' : 'Draft Job Postings'}
                </h3>
                {userRole === 'hr_senior' && (
                  <button onClick={() => setCurrentView('templates')} className="text-sm font-medium text-blue-600 hover:text-blue-800">Manage Templates →</button>
                )}
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  {userRole === 'hr_senior' 
                    ? 'Jobs created by Junior HR require your approval before going live.'
                    : 'You have job postings in draft status. Complete and submit them for approval.'
                  }
                </p>
                
                {actionItems.length === 0 ? (
                  <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex justify-center items-center">
                    <p className="text-slate-500 text-sm italic">No pending action items right now.</p>
                  </div>
                ) : (
                  actionItems.map(item => (
                    <div key={item.job_id} className="p-4 border border-orange-100 rounded-lg bg-orange-50/30 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{item.job_title}</div>
                        <div className="text-slate-500 text-xs mt-1">
                          {userRole === 'hr_senior' ? 'Pending your review' : 'Draft status'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrentView('jobs')} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50">
                          {userRole === 'hr_senior' ? 'Review & Approve' : 'Edit Draft'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Pipeline Status Overview */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-8">Pipeline Status Overview</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">New / Received</span>
                    <span className="text-slate-500">{pipelineData.newCount} ({pipelineData.totalActive > 0 ? Math.round((pipelineData.newCount / pipelineData.totalActive) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pipelineData.totalActive > 0 ? (pipelineData.newCount / pipelineData.totalActive) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">Under Review</span>
                    <span className="text-slate-500">{pipelineData.underReviewCount} ({pipelineData.totalActive > 0 ? Math.round((pipelineData.underReviewCount / pipelineData.totalActive) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pipelineData.totalActive > 0 ? (pipelineData.underReviewCount / pipelineData.totalActive) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">Shortlisted</span>
                    <span className="text-slate-500">{pipelineData.shortlistedCount} ({pipelineData.totalActive > 0 ? Math.round((pipelineData.shortlistedCount / pipelineData.totalActive) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pipelineData.totalActive > 0 ? (pipelineData.shortlistedCount / pipelineData.totalActive) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">Successful (Hired)</span>
                    <span className="text-slate-500">{pipelineData.successfulCount} ({pipelineData.totalActive > 0 ? Math.round((pipelineData.successfulCount / pipelineData.totalActive) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${pipelineData.totalActive > 0 ? (pipelineData.successfulCount / pipelineData.totalActive) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-[13px] text-slate-500">
                Total Active Applicants: <span className="font-bold text-slate-700 ml-1">{pipelineData.totalActive}</span>
              </div>
            </section>
          </div>

          {/* Right Side Container */}
          <div className="flex flex-col gap-8">
            {/* Upcoming Interview Schedule */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-6">Upcoming Interviews</h3>
              <div className="space-y-4">
                {upcomingInterviews.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">No interviews scheduled coming up.</p>
                ) : (
                  upcomingInterviews.map(interview => (
                    <div key={interview.interview_id} className="flex items-center p-5 border border-slate-100/50 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/50">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mr-5 border border-blue-100/50">
                        <ClockIcon />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-blue-700 mb-0.5">
                          {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-slate-400 font-normal ml-2">{new Date(interview.scheduled_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[15px] font-bold text-slate-800">{interview.application?.candidate?.name || 'Unknown Candidate'}</div>
                        <div className="text-[13px] text-slate-500 mt-0.5">{interview.application?.job?.job_title || 'Unknown Role'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-8">Recent Activity</h3>
              <div className="space-y-7 border-l-2 border-slate-100 ml-2 pl-6">

                {recentActivities.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">No recent activity found.</p>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div key={activity.log_id || index} className="relative">
                      <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full ${getActionTypeColor(activity.action_type)} ring-4 ring-white`}></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-800 text-[14px]">{activity.action_headline}</div>
                          <div className="text-slate-500 text-[13px] mt-0.5">{activity.action_detail}</div>
                        </div>
                        <div className="text-slate-400 text-[12px] flex items-center mt-0.5 whitespace-nowrap ml-4">
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
      ) : currentView === 'jobs' ? (
        <Jobs 
          userRole={userRole}
          onViewRanking={(jobTitle) => { 
            setSelectedJobForRanking(jobTitle || 'All Positions'); 
            setCurrentView('ranking'); 
          }} 
        />
      ) : currentView === 'templates' ? (
        <Templates userRole={userRole} />
      ) : currentView === 'ranking' ? (
        <Ranking 
          onViewDetails={(id) => { setSelectedApplicationId(id); setCurrentView('candidate-details'); }} 
          initialJobFilter={selectedJobForRanking}
          highlightedCandidateId={highlightedCandidateId}
        />
      ) : currentView === 'candidates' ? (
        <Candidates 
          onViewInRanking={(id, jobTitle) => {
            setHighlightedCandidateId(id);
            setSelectedJobForRanking(jobTitle);
            setCurrentView('ranking');
          }}
        />
      ) : currentView === 'emails' ? (
        <EmailTemplates candidateData={selectedCandidateForEmail} />
      ) : currentView === 'settings' ? (
        <ProfileSettings userName={userName} />
      ) : currentView === 'candidate-details' && selectedApplicationId ? (
        <CandidateDetails 
          applicationId={selectedApplicationId} 
          onBack={() => setCurrentView('ranking')} 
          onSendEmail={(candidate) => {
            setSelectedCandidateForEmail(candidate);
            setCurrentView('emails');
          }}
        />
      ) : (
        <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
          <div className="max-w-4xl mx-auto flex items-center justify-center h-full">
            <p className="text-slate-500 text-lg">The {currentView} view is coming soon.</p>
          </div>
        </main>
      )}
    </div>
  );
}
