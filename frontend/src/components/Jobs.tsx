import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

interface JobsProps {
  onViewRanking?: (jobTitle?: string) => void;
  departmentFilterId?: number | null;
  userRole?: string;
}

export default function Jobs({ onViewRanking, departmentFilterId, userRole }: JobsProps) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectJobId, setRejectJobId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      let query = supabase
        .from('job')
        .select(`
          *,
          job_department (
            department_name
          ),
          application (
            application_id,
            application_status
          )
        `);

      if (departmentFilterId) {
        query = query.eq('department_id', departmentFilterId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (data) {
        const now = new Date().getTime();
        const updatedJobs = data.map(job => {
          if (job.job_status === 'active' && job.application_deadline) {
            const diffTime = new Date(job.application_deadline).getTime() - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
              job.job_status = 'closed';
              supabase.from('job').update({ job_status: 'closed' }).eq('job_id', job.job_id).then();
            }
          }
          return job;
        });
        setJobs(updatedJobs);
      } else if (error) {
        console.error("Error fetching jobs:", error);
      }
      setLoading(false);
    };

    fetchJobs();
  }, [departmentFilterId]);

  const activeJobs = jobs.filter(job => job.job_status === 'active');
  const archivedJobs = jobs.filter(job => job.job_status !== 'active' && job.job_status !== 'pending_approval');
  const pendingJobs = jobs.filter(job => job.job_status === 'pending_approval');

  const getApplicantStats = (job: any) => {
    const apps = job.application || [];
    const total = apps.length;
    let unreviewed = 0;
    let shortlisted = 0;
    apps.forEach((a: any) => {
      const s = a.application_status?.toLowerCase() || '';
      if (s === 'received' || s === 'pending') unreviewed++;
      if (s.includes('shortlist') || s.includes('review')) shortlisted++;
    });
    return { total, unreviewed, shortlisted };
  };

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

  const handleDuplicateJob = async (jobToDuplicate: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return alert("Not authenticated");

      const { job_id, created_at, updated_at, job_department, user_id, application, ...rest } = jobToDuplicate;
      
      const newJob = {
        ...rest,
        job_title: `${jobToDuplicate.job_title} (Copy)`,
        job_status: 'draft',
        user_id: userData.user.id
      };

      const { data: newJobData, error: jobError } = await supabase.from('job').insert([newJob]).select().single();
      if (jobError) throw jobError;

      // Fetch existing requirements
      const { data: reqs, error: reqsError } = await supabase
        .from('job_requirement')
        .select('*')
        .eq('job_id', jobToDuplicate.job_id);
        
      if (reqsError) throw reqsError;

      if (reqs && reqs.length > 0) {
        const newReqs = reqs.map((r: any) => {
          const { requirement_id, created_at, updated_at, ...reqRest } = r;
          return { ...reqRest, job_id: newJobData.job_id };
        });
        
        const { error: insReqsError } = await supabase.from('job_requirement').insert(newReqs);
        if (insReqsError) throw insReqsError;
      }
      
      alert("Job duplicated successfully!");
      window.location.reload();
    } catch (error: any) {
      alert(`Error duplicating job: ${error.message}`);
    }
  };

  const handleApproveJob = async (jobToApprove: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // 1. Update job status
      const { data: updatedJob, error: updateError } = await supabase
        .from('job')
        .update({ job_status: 'active' })
        .eq('job_id', jobToApprove.job_id)
        .select();

      if (updateError) throw updateError;
      if (!updatedJob || updatedJob.length === 0) {
        throw new Error("Failed to update job status. This may be due to database permissions (RLS) preventing you from modifying a job created by someone else.");
      }

      if (updateError) throw updateError;

      // 2. Make template copy
      const { data: userData } = await supabase.auth.getUser();
      
      const templatePayload = {
        created_by: userData.user?.id,
        template_name: `Template: ${jobToApprove.job_title} - ${new Date().toLocaleDateString()}`,
        job_title: jobToApprove.job_title,
        department_id: jobToApprove.department_id,
        location: jobToApprove.location,
        employment_type: jobToApprove.employment_type,
        min_salary: jobToApprove.min_salary,
        max_salary: jobToApprove.max_salary,
        min_total_experience: jobToApprove.min_total_experience,
        min_relevant_experience: jobToApprove.min_relevant_experience,
        education_level: jobToApprove.education_level,
        accept_pursuing_education: jobToApprove.accept_pursuing_education,
        equivalent_experience_accepted: jobToApprove.equivalent_experience_accepted,
        strict_education_match: jobToApprove.strict_education_match,
        requires_tech_assessment: jobToApprove.requires_tech_assessment,
        responsibilities: jobToApprove.responsibilities
      };

      const { data: newTemplate, error: insertError } = await supabase
        .from('job_template')
        .insert([templatePayload])
        .select()
        .single();

      if (!insertError && newTemplate) {
        // Fetch job requirements
        const { data: reqs } = await supabase
          .from('job_requirement')
          .select('*')
          .eq('job_id', jobToApprove.job_id);

        if (reqs && reqs.length > 0) {
          const templateReqs = reqs.map((r: any) => ({
            template_id: newTemplate.template_id,
            requirement_name: r.requirement_name,
            proficiency_level: r.proficiency_level,
            is_mandatory: r.is_mandatory,
            type_id: r.type_id
          }));
          
          await supabase.from('job_template_requirement').insert(templateReqs);
        }
      }

      alert("Job Approved and Template Created successfully!");
      window.location.reload();
    } catch (error: any) {
      alert(`Error approving job: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectionNotes.trim()) {
      alert("Please enter rejection notes.");
      return;
    }
    setIsProcessing(true);
    try {
      const { data: updatedJob, error } = await supabase
        .from('job')
        .update({ 
          job_status: 'rejected',
          rejection_notes: rejectionNotes 
        })
        .eq('job_id', rejectJobId)
        .select();

      if (error) throw error;
      if (!updatedJob || updatedJob.length === 0) {
        throw new Error("Failed to reject job. This may be due to database permissions (RLS) preventing you from modifying a job created by someone else.");
      }

      if (error) throw error;

      alert("Job Rejected successfully.");
      setRejectModalOpen(false);
      window.location.reload();
    } catch (error: any) {
      alert(`Error rejecting job: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = async (jobId: string, jobTitle: string) => {
    try {
      const { data, error } = await supabase
        .from('application')
        .select(`
          application_id,
          applied_at,
          application_status,
          candidate (
            name,
            email,
            phone
          ),
          score (
            total_score
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("No applicants found for this position.");
        return;
      }

      const headers = ["Candidate Name", "Email", "Phone", "Applied Date", "Match Score", "Final Status"];
      
      const rows = data.map((app: any) => {
        const candidate = app.candidate || {};
        const score = Array.isArray(app.score) ? app.score[0] : app.score;
        const totalScore = score?.total_score ? Math.round(score.total_score) : 'N/A';
        const appliedDate = new Date(app.applied_at).toLocaleDateString();

        return [
          `"${candidate.name || 'Unknown'}"`,
          `"${candidate.email || 'N/A'}"`,
          `"${candidate.phone || 'N/A'}"`,
          `"${appliedDate}"`,
          `"${totalScore}"`,
          `"${app.application_status || 'Unknown'}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${jobTitle.replace(/\s+/g, '_')}_Hiring_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error("Error generating report:", err);
      alert("Failed to generate report: " + err.message);
    }
  };

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-6xl mx-auto xl:mx-0">
        <div className="flex justify-between items-start mb-8">
          <header className="text-left">
            <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Job Openings</h1>
            <p className="text-slate-500 text-[15px]">Manage your active job postings and consult archived hiring cycles.</p>
          </header>
          {!departmentFilterId && (
            <button 
              onClick={() => navigate('/create-job')}
              className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors shadow-sm"
            >
              <span className="mr-2 text-lg leading-none">+</span> Create Job
            </button>
          )}
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
                          {!departmentFilterId && (
                            <>
                              <button 
                                onClick={() => handleDuplicateJob(job)}
                                className="text-slate-400 hover:text-[#1d4ed8] transition-colors"
                                title="Duplicate Job"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                              </button>
                              <button 
                                onClick={() => navigate(`/edit-job/${job.job_id}`)}
                                className="text-slate-400 hover:text-[#1d4ed8] transition-colors"
                                title="Edit Job"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                </svg>
                              </button>
                            </>
                          )}
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
                          {(() => {
                            const stats = getApplicantStats(job);
                            return (
                              <>{stats.total} applicants (<span className="text-[#1d4ed8] font-medium mx-1">{stats.unreviewed} unreviewed</span> • <span className="text-[#16a34a] font-medium ml-1">{stats.shortlisted} shortlisted</span>)</>
                            );
                          })()}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">🕒</span>
                          Posted {getDaysAgo(job.created_at)} • Closes in <span className="text-orange-500 font-medium ml-1">{getDaysUntil(job.application_deadline)}</span>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => onViewRanking && onViewRanking(job.job_title)}
                          className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                        >
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

            {/* Pending Approvals Section */}
            {pendingJobs.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6 text-left flex items-center gap-2">
                  <span className="text-orange-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </span>
                  Pending Approvals
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
                  {pendingJobs.map((job) => (
                    <div key={job.job_id} className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm flex flex-col bg-orange-50/10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mr-3"></div>
                          <h3 className="text-xl font-serif font-bold text-[#0f172a]">{job.job_title}</h3>
                        </div>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Pending Review</span>
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
                          <span className="mr-3 opacity-50">🕒</span>
                          Submitted {getDaysAgo(job.created_at)}
                        </div>
                      </div>

                      <div className="mt-auto flex gap-3">
                        {userRole === 'hr_senior' ? (
                          <>
                            <button 
                              onClick={() => navigate(`/edit-job/${job.job_id}`)}
                              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors"
                            >
                              Review Details
                            </button>
                            <button 
                              onClick={() => {
                                setRejectJobId(job.job_id);
                                setRejectModalOpen(true);
                              }}
                              disabled={isProcessing}
                              className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleApproveJob(job)}
                              disabled={isProcessing}
                              className="flex-1 bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                          </>
                        ) : (
                          <div className="w-full text-center text-sm text-slate-500 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            Waiting for HR Senior approval
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">{job.job_status}</span>
                          {!departmentFilterId && (
                            <button 
                              onClick={() => handleDuplicateJob(job)}
                              className="text-slate-400 hover:text-[#1d4ed8] transition-colors"
                              title="Duplicate Job"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          )}
                        </div>
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
                          {job.application?.length || 0} historical applicants
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="mr-3 opacity-50">🕒</span>
                          Posted {getDaysAgo(job.created_at)}
                        </div>
                      </div>

                      <div className="mt-auto">
                        {(!departmentFilterId || (job.job_status !== 'draft' && job.job_status !== 'rejected')) && (
                          (job.job_status === 'draft' || job.job_status === 'rejected') ? (
                            <button 
                              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors mb-3"
                              onClick={() => navigate(`/edit-job/${job.job_id}`)}
                            >
                              {job.job_status === 'draft' ? 'Edit Draft' : 'Edit Rejected Job'}
                            </button>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <button 
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors"
                                onClick={() => onViewRanking && onViewRanking(job.job_title)}
                              >
                                View Applicants
                              </button>
                              <button 
                                className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
                                onClick={() => handleDownloadReport(job.job_id, job.job_title)}
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Report
                              </button>
                            </div>
                          )
                        )}
                        <p className="text-xs text-slate-400 px-1">
                          {job.job_status === 'draft' ? 'Draft Record — Hidden from public.' : 
                           job.job_status === 'rejected' ? 'Rejected — Please review notes and edit.' :
                           'Archived Record — Locked for data integrity.'}
                        </p>
                        {job.job_status === 'rejected' && job.rejection_notes && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                            <strong className="block mb-1 font-semibold">Rejection Reason:</strong>
                            {job.rejection_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative text-left">
            <h3 className="text-xl font-serif font-bold text-[#0f172a] mb-2">Reject Job Opening</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting this job opening. This will be visible to the HR Junior.</p>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] mb-4 min-h-[100px]"
              placeholder="E.g., Salary budget is too high, missing mandatory skills..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitRejection}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Reject Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
