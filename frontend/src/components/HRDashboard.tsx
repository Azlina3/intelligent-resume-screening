import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import ProfileSettings from './ProfileSettings';
import Jobs from './Jobs';
import Candidates from './Candidates';
import Ranking from './Ranking';
import CandidateDetails from './CandidateDetails';

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

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function HRDashboard({ userName }: { userName?: string }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'jobs' | 'candidates' | 'ranking' | 'emails'>('dashboard');

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
                onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}
                className={`flex items-center px-8 py-3 ${currentView === 'dashboard' ? 'bg-white text-[#1e293b] rounded-r-[32px] mr-6 shadow-sm' : 'text-slate-300 hover:text-white transition-colors'} font-medium`}
              >
                <span className="mr-3">
                  <LayoutDashboardIcon />
                </span>
                HR Dashboard
              </a>
            </li>
            {[
              { name: 'Jobs', icon: <MenuBriefcaseIcon /> },
              { name: 'Candidates', icon: <UsersIcon /> },
              { name: 'Ranking', icon: <ChartBarIcon /> },
              { name: 'Emails', icon: <MailIcon /> }
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
          <ul className="space-y-4">
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }}
                className={`flex items-center ${currentView === 'settings' ? 'px-8 py-3 bg-white text-[#1e293b] rounded-r-[32px] mr-6 shadow-sm font-medium' : 'px-8 text-slate-300 hover:text-white text-[15px]'}`}
              >
                <span className="mr-3 opacity-60">⚙️</span>
                Profile Settings
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
          <p className="text-slate-500 text-[15px]">Here is your recruitment overview for today, June 3, 2026.</p>
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
            <div className="text-[38px] font-serif text-[#1a56db] mb-5 leading-none">4</div>
            <div className="mt-auto pt-4 border-t border-slate-50/0">
              <a href="#" className="text-[#1a56db] text-sm font-medium hover:underline flex items-center">
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
            <div className="text-[38px] font-serif text-green-600 mb-5 leading-none">+23</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px]">Received since your login yesterday</p>
            </div>
          </div>

          {/* Card 3: Pending Evaluations */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Pending Evaluations</span>
              <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100">
                <AlertIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-[#ea580c] mb-5 leading-none">14</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px]">Awaiting initial screening</p>
            </div>
          </div>
        </div>

        {/* 2. Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Left Side Container */}
          <div className="flex flex-col gap-8">
            {/* Urgent Action Items Checklist */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-6">Urgent Action Items</h3>
              <ul className="space-y-5">
                <li className="flex items-start">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1a56db] focus:ring-[#1a56db] cursor-pointer accent-[#1a56db]" />
                  <span className="ml-4 text-slate-700 text-[14px]">Schedule technical interview for 3 DevOps candidates</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1a56db] focus:ring-[#1a56db] cursor-pointer accent-[#1a56db]" />
                  <span className="ml-4 text-slate-700 text-[14px]">Approve salary range criteria for incoming Product Manager draft posting</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1a56db] focus:ring-[#1a56db] cursor-pointer accent-[#1a56db]" />
                  <span className="ml-4 text-slate-700 text-[14px]">2 Job openings closing in less than 48 hours</span>
                </li>
              </ul>
            </section>

            {/* Pipeline Status Overview */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-8">Pipeline Status Overview</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">New</span>
                    <span className="text-slate-500">154 (40%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">Under Review</span>
                    <span className="text-slate-500">135 (35%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">Shortlisted</span>
                    <span className="text-slate-500">58 (15%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2.5">
                    <span className="font-semibold text-slate-700">Rejected</span>
                    <span className="text-slate-500">39 (10%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-slate-300 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-[13px] text-slate-500">
                Total Active Applicants: <span className="font-bold text-slate-700 ml-1">386</span>
              </div>
            </section>
          </div>

          {/* Right Side Container */}
          <div className="flex flex-col gap-8">
            {/* Today's Interview Schedule */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-6">Today's Interview Schedule</h3>
              <div className="space-y-4">

                <div className="flex items-center p-5 border border-slate-100/50 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/50">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mr-5 border border-blue-100/50">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-blue-700 mb-0.5">10:00 AM</div>
                    <div className="text-[15px] font-bold text-slate-800">Ahmad Razak</div>
                    <div className="text-[13px] text-slate-500 mt-0.5">Software Engineer - Technical Round</div>
                  </div>
                </div>

                <div className="flex items-center p-5 border border-slate-100/50 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/50">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mr-5 border border-blue-100/50">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-blue-700 mb-0.5">2:30 PM</div>
                    <div className="text-[15px] font-bold text-slate-800">Sarah Tan</div>
                    <div className="text-[13px] text-slate-500 mt-0.5">UI Designer - Culture Fit</div>
                  </div>
                </div>

              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-slate-800 mb-8">Recent Activity</h3>
              <div className="space-y-7 border-l-2 border-slate-100 ml-2 pl-6">

                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-[14px]">New application received</div>
                      <div className="text-slate-500 text-[13px] mt-0.5">Senior Frontend Developer</div>
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-0.5">
                      <span className="mr-1">🕒</span> 2 hours ago
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-[14px]">Candidate shortlisted</div>
                      <div className="text-slate-500 text-[13px] mt-0.5">Product Manager</div>
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-0.5">
                      <span className="mr-1">🕒</span> 5 hours ago
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-[14px]">Interview scheduled</div>
                      <div className="text-slate-500 text-[13px] mt-0.5">UX Designer</div>
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-0.5">
                      <span className="mr-1">🕒</span> 1 day ago
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-[14px]">New application received</div>
                      <div className="text-slate-500 text-[13px] mt-0.5">Backend Engineer</div>
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-0.5">
                      <span className="mr-1">🕒</span> 1 day ago
                    </div>
                  </div>
                </div>

              </div>
            </section>

          </div>
        </div>
      </main>
      ) : currentView === 'jobs' ? (
        <Jobs />
      ) : currentView === 'settings' ? (
        <ProfileSettings userName={userName} />
      ) : currentView === 'candidates' ? (
        <Candidates />
      ) : currentView === 'candidate-details' ? (
        <CandidateDetails onBack={() => setCurrentView('ranking')} />
      ) : currentView === 'ranking' ? (
        <Ranking onViewDetails={() => setCurrentView('candidate-details')} />
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
