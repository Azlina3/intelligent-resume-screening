import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import ProfileSettings from './ProfileSettings';
import Jobs from './Jobs';

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

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function ManagerDashboard({ userName }: { userName?: string }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'jobs' | 'candidates' | 'ranking' | 'emails'>('dashboard');

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
                className={`flex items-center px-8 py-3 ${currentView === 'dashboard' ? 'bg-white text-[#1e293b] rounded-r-[32px] mr-6 shadow-sm' : 'text-slate-300 hover:text-white transition-colors'} font-medium`}
              >
                <span className="mr-3">
                  <ManagerViewIcon />
                </span>
                Manager View
              </a>
            </li>
            {['Jobs', 'Candidates', 'Ranking', 'Emails'].map((item) => {
              const viewName = item.toLowerCase() as typeof currentView;
              return (
              <li key={item}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentView(viewName); }}
                  className={`flex items-center px-8 py-2.5 transition-colors ${currentView === viewName ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
                >
                  <span className="mr-3 opacity-60">
                    <ChevronRightIcon />
                  </span>
                  <span className="text-[15px]">{item}</span>
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
          <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Welcome back, {userName || 'Manager'}</h1>
          <p className="text-slate-500 text-[15px]">Scope restricted to: Technology & Engineering Department.</p>
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
            <div className="text-[38px] font-serif text-[#ea580c] mb-1 leading-none">8</div>
          </div>

          {/* Card 2: Open Engineering Roles */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Open Engineering Roles</span>
              <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                <BriefcaseIcon />
              </div>
            </div>
            <div className="text-[38px] font-serif text-[#1a56db] mb-5 leading-none">2</div>
            <div className="mt-auto">
              <p className="text-slate-400 text-[13px]">Software Engineer, DevOps Architect</p>
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
                <p className="text-slate-500 text-[14px]">HR-screened candidates requiring your final approval to interview</p>
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
                    
                    {/* Row 1 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-semibold text-slate-800 text-[15px]">Daniel Hakim</td>
                      <td className="py-5 px-4 text-slate-500 text-[14px]">Software Engineer</td>
                      <td className="py-5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Rank #1
                        </span>
                      </td>
                      <td className="py-5 px-4 font-bold text-emerald-600">94%</td>
                      <td className="py-5 px-8">
                        <button className="bg-[#1a56db] hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors">
                          Review Resume
                        </button>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-semibold text-slate-800 text-[15px]">Nurul Aisyah</td>
                      <td className="py-5 px-4 text-slate-500 text-[14px]">Software Engineer</td>
                      <td className="py-5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Rank #2
                        </span>
                      </td>
                      <td className="py-5 px-4 font-bold text-emerald-600">91%</td>
                      <td className="py-5 px-8">
                        <button className="bg-[#1a56db] hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors">
                          Review Resume
                        </button>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-semibold text-slate-800 text-[15px]">Wei Chen</td>
                      <td className="py-5 px-4 text-slate-500 text-[14px]">DevOps Architect</td>
                      <td className="py-5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Rank #1
                        </span>
                      </td>
                      <td className="py-5 px-4 font-bold text-blue-600">89%</td>
                      <td className="py-5 px-8">
                        <button className="bg-[#1a56db] hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors">
                          Review Resume
                        </button>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-semibold text-slate-800 text-[15px]">Priya Sharma</td>
                      <td className="py-5 px-4 text-slate-500 text-[14px]">Software Engineer</td>
                      <td className="py-5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                          Rank #3
                        </span>
                      </td>
                      <td className="py-5 px-4 font-bold text-blue-600">87%</td>
                      <td className="py-5 px-8">
                        <button className="bg-[#1a56db] hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors">
                          Review Resume
                        </button>
                      </td>
                    </tr>

                    {/* Row 5 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-semibold text-slate-800 text-[15px]">Marcus Lee</td>
                      <td className="py-5 px-4 text-slate-500 text-[14px]">DevOps Architect</td>
                      <td className="py-5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Rank #2
                        </span>
                      </td>
                      <td className="py-5 px-4 font-bold text-blue-600">85%</td>
                      <td className="py-5 px-8">
                        <button className="bg-[#1a56db] hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors">
                          Review Resume
                        </button>
                      </td>
                    </tr>

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
                
                {/* Activity 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <div className="flex flex-col">
                    <div className="font-semibold text-slate-800 text-[14px] leading-snug">
                      Aida forwarded 3 new candidate profiles for Software Engineer
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-1.5">
                      <span className="mr-1">🕒</span> 3 hours ago
                    </div>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <div className="flex flex-col">
                    <div className="font-semibold text-slate-800 text-[14px] leading-snug">
                      System completed parsed ranking execution for DevOps role
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-1.5">
                      <span className="mr-1">🕒</span> Yesterday
                    </div>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white"></div>
                  <div className="flex flex-col">
                    <div className="font-semibold text-slate-800 text-[14px] leading-snug">
                      Interview feedback submitted for candidate Joshua
                    </div>
                    <div className="text-slate-400 text-[12px] flex items-center mt-1.5">
                      <span className="mr-1">🕒</span> 2 days ago
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
