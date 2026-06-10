import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('job')
        .select(`
          *,
          job_department (
            department_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (data) {
        setJobs(data);
      } else if (error) {
        console.error("Error fetching jobs:", error);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const activeJobs = jobs.filter(job => job.job_status === 'active');
  const archivedJobs = jobs.filter(job => job.job_status !== 'active');

  const getDaysAgo = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const diffTime = new Date().getTime() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return 'No deadline';
    const diffTime = new Date(dateStr).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays < 0) return 'Closed';
    if (diffDays === 0) return 'Closes today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  const copyLink = (jobId: string) => {
    const appLink = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(appLink);
    alert(`Application link copied:\n${appLink}`);
  };

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-6xl mx-auto xl:mx-0">
        <div className="flex justify-between items-start mb-8">
          <header className="text-left">
            <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Job Openings</h1>
            <p className="text-slate-500 text-[15px]">Manage your active job postings and consult archived hiring cycles.</p>
          </header>
          <button 
            onClick={() => navigate('/create-job')}
            className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors shadow-sm"
          >
            <span className="mr-2 text-lg leading-none">+</span> Create Job
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-10">
          <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[160px]">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Product</option>
            <option>Design</option>
          </select>
          <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[160px]">
            <option>Status: All</option>
            <option>Status: Active</option>
            <option>Status: Archived</option>
          </select>
          <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[160px]">
            <option>Sort By: Most Urgent</option>
            <option>Sort By: Newest</option>
            <option>Sort By: Oldest</option>
          </select>
        </div>

        {loading ? (
          <div className="text-left text-slate-500">Loading jobs...</div>
        ) : (
          <>
            {/* Active Positions Section */}
            <section className="mb-12">
              <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6 text-left">Active Positions</h2>
              
              {activeJobs.length === 0 ? (
                <div className="text-left text-slate-500 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  No active jobs found. Create one to get started!
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
                  {activeJobs.map((job) => (
                    <div key={job.job_id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#1d4ed8] mr-3"></div>
                          <h3 className="text-xl font-serif font-bold text-[#0f172a]">{job.job_title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-[#1d4ed8] text-white text-xs font-medium rounded-full">Active</span>
                          <button 
                            className="text-slate-400 hover:text-[#1d4ed8] transition-colors"
                            title="Edit Job"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-slate-500 text-sm mb-4">
                        {job.job_department?.department_name || 'General'}
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">📍</span>
                          {job.location || 'Not specified'}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">👥</span>
                          0 applicants (<span className="text-[#1d4ed8] font-medium mx-1">0 unreviewed</span> • <span className="text-[#16a34a] font-medium ml-1">0 shortlisted</span>)
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">🕒</span>
                          Posted {getDaysAgo(job.created_at)} • Closes in <span className="text-orange-500 font-medium ml-1">{getDaysUntil(job.application_deadline)}</span>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
                          View Applicants
                        </button>
                        <button 
                          onClick={() => copyLink(job.job_id)}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
                        >
                          <span className="mr-2">📄</span> Copy Application Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Archived Positions Section */}
            <section className="mb-12">
              <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6 text-left">Archived & Draft Positions</h2>
              
              {archivedJobs.length === 0 ? (
                <div className="text-left text-slate-500 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  No archived or draft jobs found.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
                  {archivedJobs.map((job) => (
                    <div key={job.job_id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-serif font-bold text-[#0f172a] pl-5">{job.job_title}</h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">{job.job_status}</span>
                      </div>
                      
                      <div className="text-slate-500 text-sm mb-4 pl-5">
                        {job.job_department?.department_name || 'General'}
                      </div>
                      
                      <div className="space-y-2 mb-6 pl-5">
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">📍</span>
                          {job.location || 'Not specified'}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">👥</span>
                          0 historical applicants
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">🕒</span>
                          Posted {getDaysAgo(job.created_at)}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <button 
                          className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors mb-3"
                          onClick={() => {
                            if (job.job_status === 'draft') {
                              alert("Edit draft feature coming soon.");
                            } else {
                              alert("Historical records coming soon.");
                            }
                          }}
                        >
                          {job.job_status === 'draft' ? 'Edit Draft' : 'View Historical Records'}
                        </button>
                        <p className="text-xs text-slate-400 px-1">
                          {job.job_status === 'draft' ? 'Draft Record — Hidden from public.' : 'Archived Record — Locked for data integrity.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
