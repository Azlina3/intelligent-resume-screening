import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { isSkillMatch } from '../utils/MatchingEngine';

// --- Icons ---
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
);
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const XCircleIcon = () => (
  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const RibbonIcon = () => (
  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
);
const PhoneIcon = () => (
  <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
);
const EducationIcon = () => (
  <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6m0 0a2 2 0 01-2-2m2 2a2 2 0 002-2"></path></svg>
);
const ExperienceIcon = () => (
  <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
);
const DocumentIcon = () => (
  <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
);

export default function CandidateDetails({ 
  applicationId, 
  onBack,
  onSendEmail
}: { 
  applicationId: string;
  onBack: () => void;
  onSendEmail?: (candidate: any) => void;
}) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: appData, error: appError } = await supabase
        .from('application')
        .select(`
          *,
          candidate (*),
          job (*),
          score (
            total_score,
            score_breakdown (*)
          )
        `)
        .eq('application_id', applicationId)
        .single();
        
      if (appError) throw appError;

      const { data: reqData, error: reqError } = await supabase
        .from('job_requirement')
        .select('*')
        .eq('job_id', appData.job_id);

      if (reqError) throw reqError;

      // Fetch extracted data separately
      const { data: extData, error: extError } = await supabase
        .from('extracted_data')
        .select('*')
        .eq('application_id', applicationId);
        
      if (extError) throw extError;

      // We process languages separately for the UI, they shouldn't appear as additional skills
      const extractedSkills = [
        ...(extData?.map((d: any) => d.extracted_value.toLowerCase()) || [])
      ].filter(Boolean);

      const candidateEmbeddings = [
        ...(extData?.map((d: any) => ({ name: d.extracted_value, embedding: d.embedding })) || [])
      ].filter(Boolean);

      // Filter out Education Requirements (type_id = 4) from Skills Match
      const skillsReqData = reqData?.filter((req: any) => req.type_id !== 4) || [];

      // Include language proficiency context so the matcher can detect communication skills
      const candidateLanguagesFull = appData.language?.map((l: any) => `${l.language} ${l.proficiency}`.toLowerCase()) || [];
      const skillsToMatchAgainst = [...extractedSkills, ...candidateLanguagesFull];

      const matchedSkills = skillsReqData.filter((req: any) => 
        isSkillMatch(req.requirement_name, skillsToMatchAgainst, req.embedding, candidateEmbeddings)
      ).map((r: any) => r.requirement_name);
      
      const missingSkills = skillsReqData.filter((req: any) => 
        !isSkillMatch(req.requirement_name, skillsToMatchAgainst, req.embedding, candidateEmbeddings)
      ).map((r: any) => r.requirement_name);
      
      const additionalSkills = extractedSkills
        .filter((skill: string) => {
          const candEmbed = candidateEmbeddings.find(c => c.name.toLowerCase() === skill.toLowerCase())?.embedding;
          return !skillsReqData.some((req: any) => isSkillMatch(req.requirement_name, [skill], req.embedding, [{ name: skill, embedding: candEmbed }]));
        });

      const scoreData = Array.isArray(appData.score) ? appData.score[0] : appData.score;
      const breakdowns = scoreData?.score_breakdown || [];
      const mandatory = breakdowns.find((b: any) => b.criteria === 'Mandatory Requirements')?.score_value || 0;
      const optional = breakdowns.find((b: any) => b.criteria === 'Optional Requirements')?.score_value || 0;
      const skillsMatchPoints = Number(mandatory) + Number(optional);
      
      let maxSkillsPoints = 0;
      skillsReqData.forEach((req: any) => {
        maxSkillsPoints += req.is_mandatory ? 10 : 3;
      });
      const skillsMatch = maxSkillsPoints > 0 ? Math.round((skillsMatchPoints / maxSkillsPoints) * 100) : 0;

      const rawEdu = Number(breakdowns.find((b: any) => b.criteria === 'Education Match')?.score_value || 0);
      const educationMatch = Math.round((rawEdu / 10) * 100);

      const rawExp = Number(breakdowns.find((b: any) => b.criteria === 'Experience Match')?.score_value || 0);
      const experienceMatch = Math.round((rawExp / 10) * 100);

      setData({
        ...appData,
        scoreData,
        skillsMatch,
        educationMatch,
        experienceMatch,
        matchedSkills,
        missingSkills,
        additionalSkills,
        requiredCount: reqData?.length || 0
      });
      
    } catch (err: any) {
      console.error('Error fetching details:', err);
      setErrorMsg(err.message || 'Failed to load details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
        <div className="flex items-center justify-center h-full">
          <svg className="w-8 h-8 animate-spin text-[#1d4ed8]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      </main>
    );
  }

  if (errorMsg || !data) {
    return (
      <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-slate-500 mb-4">{errorMsg || 'Failed to load candidate details.'}</p>
          <button onClick={onBack} className="px-4 py-2 bg-[#1e293b] text-white rounded-lg">Go Back</button>
        </div>
      </main>
    );
  }

  const candidate = data.candidate || {};
  const job = data.job || {};

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-7xl mx-auto xl:mx-0 w-full">
        
        {/* Navigation & Header */}
        <button 
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm mb-8 transition-colors"
        >
          <ArrowLeftIcon /> Back to Candidates
        </button>

        <div className="flex justify-between items-start mb-10">
          <div className="text-left">
            <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-1 tracking-tight">{candidate.name || 'Unknown'}</h1>
            <p className="text-slate-500 text-lg">{job.job_title || 'Unknown Position'}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-serif font-bold leading-none mb-1 ${
              (data.scoreData?.total_score || 0) >= 90 ? 'text-[#16a34a]' : 'text-[#3b82f6]'
            }`}>
              {Math.round(data.scoreData?.total_score || 0)}%
            </div>
            <div className="text-slate-500 text-sm font-medium">Match Score</div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column (Left) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Score Breakdown Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-8">Score Breakdown</h2>
              
              <div className="space-y-8">
                {/* Skills */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-[#0f172a]">Skills Match</span>
                    <span className="text-xl font-serif font-bold text-[#0f172a]">{data.skillsMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-[#1e293b] h-3 rounded-full" style={{ width: `${data.skillsMatch}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {data.matchedSkills.length}/{data.requiredCount} required skills matched
                  </p>
                </div>

                {/* Education */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-[#0f172a]">Education Match</span>
                    <span className="text-xl font-serif font-bold text-[#0f172a]">{data.educationMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-[#1e293b] h-3 rounded-full" style={{ width: `${data.educationMatch}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-400">Calculated based on {data.highest_education || 'Unknown'}</p>
                </div>

                {/* Experience */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-[#0f172a]">Experience Match</span>
                    <span className="text-xl font-serif font-bold text-[#0f172a]">{data.experienceMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-[#1e293b] h-3 rounded-full" style={{ width: `${data.experienceMatch}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {data.years_of_experience || 0} years calculated vs {job.min_total_experience || 0}+ years required
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Analysis Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-8">Skills Analysis</h2>
              
              <div className="space-y-8">
                <div>
                  <div className="flex items-center text-[#0f172a] font-semibold mb-4">
                    <CheckCircleIcon /> Matched Skills
                  </div>
                  <div className="flex gap-2 flex-wrap ml-7">
                    {data.matchedSkills.length > 0 ? (
                      data.matchedSkills.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None extracted</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-[#0f172a] font-semibold mb-4">
                    <XCircleIcon /> Missing Skills
                  </div>
                  <div className="flex gap-2 flex-wrap ml-7">
                    {data.missingSkills.length > 0 ? (
                      data.missingSkills.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full border border-red-100">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None missing</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-[#0f172a] font-semibold mb-4">
                    <RibbonIcon /> Additional Skills
                  </div>
                  <div className="flex gap-2 flex-wrap ml-7">
                    {data.additionalSkills.length > 0 ? (
                      data.additionalSkills.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-full border border-slate-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None extracted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Sidebar Column (Right) */}
          <div className="space-y-6">
            
            {/* Candidate Photo Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
              <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-200 rounded-lg flex flex-col items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                {data.applicant_image ? (
                  <img src={data.applicant_image} alt={`${candidate.name} Photo`} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-32 h-32 text-slate-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <div className="text-slate-400 font-medium text-sm tracking-widest uppercase">
                      Photo Unavailable
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Contact Information</h3>
              <div className="space-y-5">
                <div className="flex items-start">
                  <MailIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Email</div>
                    <div className="text-sm font-medium text-slate-800">{candidate.email || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Phone</div>
                    <div className="text-sm font-medium text-slate-800">{candidate.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Qualifications</h3>
              <div className="space-y-5">
                <div className="flex items-start">
                  <EducationIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Education</div>
                    <div className="text-sm font-medium text-slate-800 leading-tight">
                      {data.highest_education || 'Not specified'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <ExperienceIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Experience</div>
                    <div className="text-sm font-medium text-slate-800">
                      {data.years_of_experience ? `${data.years_of_experience} years` : 'Not specified'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <DocumentIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Applied</div>
                    <div className="text-sm font-medium text-slate-800">
                      {data.applied_at ? new Date(data.applied_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages Card */}
            {data.language && data.language.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm text-left">
                <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Languages</h3>
                <div className="space-y-4">
                  {data.language.map((lang: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                      <span className="font-medium text-slate-800 text-sm capitalize">{lang.language || lang.name}</span>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {lang.proficiency || 'Not specified'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Actions</h3>
              <div className="space-y-3">
                <button 
                  className={`w-full ${data.application_status === 'Shortlisted' ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'bg-[#1d4ed8] hover:bg-[#1e40af] border-[#1d4ed8]'} text-white border py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center`}
                  onClick={async () => {
                    if (data.application_status === 'Shortlisted') return;
                    try {
                      const { error } = await supabase
                        .from('application')
                        .update({ application_status: 'Shortlisted' })
                        .eq('application_id', data.application_id);
                      if (error) throw error;
                      alert("Candidate successfully shortlisted!");
                      window.location.reload(); // Refresh to show new status
                    } catch (err: any) {
                      alert("Failed to shortlist candidate: " + err.message);
                    }
                  }}
                >
                  {data.application_status === 'Shortlisted' ? 'Shortlisted ✓' : 'Shortlist Candidate'}
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSendEmail) {
                      onSendEmail({
                        id: data.application_id,
                        name: candidate.name,
                        email: candidate.email,
                        jobTitle: job.job_title
                      });
                    }
                  }}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
                >
                  Send Email
                </button>
                <a 
                  href={data.resume_file || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
                >
                  Download Resume
                </a>
                {data.other_docs && (
                  <a 
                    href={data.other_docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
                  >
                    Download Other Docs
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}

