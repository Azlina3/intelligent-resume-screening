import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function JobForm() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [jobDetails, setJobDetails] = useState<any>(null);
  const [jobRequirements, setJobRequirements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [skills, setSkills] = useState(["Python", "FastAPI", "React", "PostgreSQL"]);
  const [newSkill, setNewSkill] = useState("");
  
  const [portfolios, setPortfolios] = useState(["", ""]);

  const [otherDocs, setOtherDocs] = useState<string[]>([]);
  
  const handleOtherDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => file.name);
      setOtherDocs([...otherDocs, ...newFiles]);
    }
  };
  
  const removeOtherDoc = (indexToRemove: number) => {
    setOtherDocs(otherDocs.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data: jobData, error: jobError } = await supabase
          .from('job')
          .select('*, job_department(department_name)')
          .eq('job_id', jobId)
          .single();
          
        if (jobError) throw jobError;
        setJobDetails(jobData);

        const { data: reqData, error: reqError } = await supabase
          .from('job_requirement')
          .select('*')
          .eq('job_id', jobId);
          
        if (reqError) throw reqError;
        setJobRequirements(reqData || []);
        
      } catch (error) {
        console.error("Error fetching job data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobData();
  }, [jobId]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeName(e.target.files[0].name);
      setResumeUploaded(true);
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const addSkill = () => {
    if (newSkill.trim() !== "") {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const updatePortfolio = (index: number, value: string) => {
    const newPortfolios = [...portfolios];
    newPortfolios[index] = value;
    setPortfolios(newPortfolios);
  };

  const addPortfolio = () => {
    setPortfolios([...portfolios, ""]);
  };

  const removePortfolio = (index: number) => {
    if (portfolios.length > 1) {
      setPortfolios(portfolios.filter((_, i) => i !== index));
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-slate-500 font-medium text-lg">Loading Job Details...</p>
      </main>
    );
  }

  const jobTitle = jobDetails?.job_title || "Position";

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-4xl flex flex-col relative overflow-hidden">
        
        {/* Header with Back Button */}
        <div className="bg-white z-10 flex justify-start p-6 pb-0">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </button>
        </div>

        <div className="px-8 pb-12 pt-6 sm:px-12 sm:pb-16 text-left">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-[#0f172a] mb-3 tracking-tight">Job Application</h1>
            <p className="text-slate-500 text-base">Apply for {jobTitle} position {jobDetails?.location && `• ${jobDetails.location}`}</p>
          </div>

          {/* Job Overview & Requirements Display */}
          <div className="mb-12 bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-4 border-b border-slate-200 pb-2">Job Overview & Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm mb-8">
              {jobDetails?.responsibilities?.map((resp: string, idx: number) => (
                <li key={idx}>{resp}</li>
              ))}
              {!jobDetails?.responsibilities?.length && <li>No responsibilities listed.</li>}
            </ul>

            <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-4 border-b border-slate-200 pb-2">Core Requirements</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technical */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-[#0f172a] mb-4 text-sm flex items-center border-b border-slate-100 pb-2"><span className="mr-2">💻</span> Technical Skills</h3>
                <ul className="space-y-3">
                  {jobRequirements.filter(r => r.type_id === 1).map((req, idx) => (
                    <li key={idx} className="flex justify-between items-start text-xs">
                      <span className="font-medium text-slate-700">{req.requirement_name} {req.is_mandatory && <span className="text-red-500 ml-1" title="Mandatory">*</span>}</span>
                      <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{req.proficiency_level}</span>
                    </li>
                  ))}
                  {jobRequirements.filter(r => r.type_id === 1).length === 0 && <li className="text-xs text-slate-400">None specified</li>}
                </ul>
              </div>
              
              {/* Soft Skills */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-[#0f172a] mb-4 text-sm flex items-center border-b border-slate-100 pb-2"><span className="mr-2">🤝</span> Soft Skills</h3>
                <ul className="space-y-3">
                  {jobRequirements.filter(r => r.type_id === 2).map((req, idx) => (
                    <li key={idx} className="flex justify-between items-start text-xs">
                      <span className="font-medium text-slate-700">{req.requirement_name} {req.is_mandatory && <span className="text-red-500 ml-1" title="Mandatory">*</span>}</span>
                      <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{req.proficiency_level}</span>
                    </li>
                  ))}
                  {jobRequirements.filter(r => r.type_id === 2).length === 0 && <li className="text-xs text-slate-400">None specified</li>}
                </ul>
              </div>

              {/* Domain */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-[#0f172a] mb-4 text-sm flex items-center border-b border-slate-100 pb-2"><span className="mr-2">🌐</span> Domain Knowledge</h3>
                <ul className="space-y-3">
                  {jobRequirements.filter(r => r.type_id === 3).map((req, idx) => (
                    <li key={idx} className="flex justify-between items-start text-xs">
                      <span className="font-medium text-slate-700">{req.requirement_name} {req.is_mandatory && <span className="text-red-500 ml-1" title="Mandatory">*</span>}</span>
                      <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{req.proficiency_level}</span>
                    </li>
                  ))}
                  {jobRequirements.filter(r => r.type_id === 3).length === 0 && <li className="text-xs text-slate-400">None specified</li>}
                </ul>
              </div>
            </div>
          </div>

          <form className="space-y-12">
            
            {/* 1. Personal Information */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">
                1. Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input type="text" placeholder="e.g., John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Identification / Passport Number</label>
                  <input type="text" placeholder="e.g., 020405-04-XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" placeholder="e.g., john@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" placeholder="e.g., +60 12-345 6789" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
              </div>
            </section>

            {/* 2. Professional Background & Expertise */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">
                2. Professional Background & Expertise
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Profile Photo (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400 mb-3 group-hover:text-[#1d4ed8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">Click or drag to upload profile photo</p>
                      <p className="text-xs text-slate-400 mt-1">JPG or PNG format only</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume</label>
                  {!resumeUploaded ? (
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleResumeUpload}
                      />
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400 mb-3 group-hover:text-[#1d4ed8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-sm font-medium text-slate-700">Click or drag to upload resume</p>
                        <p className="text-xs text-slate-400 mt-1">PDF format only</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#1d4ed8]/30 bg-[#1d4ed8]/5 rounded-xl p-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                         <svg className="w-8 h-8 text-[#1d4ed8] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-base font-semibold text-[#0f172a]">{resumeName}</p>
                        <p className="text-xs text-slate-500 mt-1">PDF format only</p>
                      </div>
                    </div>
                  )}
                </div>

                {resumeUploaded && (
                  <div className="mt-8 bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Review Extracted Data (Verify & Edit If Necessary)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Highest Education Level</label>
                        <div className="relative">
                          <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors">
                            <option>Bachelor's Degree in Computer Science</option>
                            <option>Master's Degree</option>
                            <option>PhD</option>
                            <option>Diploma</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Total Years of Experience</label>
                        <input type="number" defaultValue={3} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-slate-700 mb-3">Extracted Key Skills</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, index) => (
                          <div key={index} className="flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => removeSkill(index)}
                              className="ml-2 text-green-600 hover:text-green-900 focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Add a skill" 
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 max-w-xs bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                        />
                        <button 
                          type="button" 
                          onClick={addSkill}
                          className="w-10 h-10 rounded-lg bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-4">Work Experiences Breakdown</label>
                      <div className="space-y-4 mb-4">
                        <div className="p-5 bg-white border border-slate-200 rounded-xl">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Experience 1</p>
                          <input 
                            type="text" 
                            defaultValue="Junior Software Engineer" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm text-slate-800 font-medium mb-3 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                          />
                          <textarea 
                            rows={2} 
                            defaultValue="Developed scalable REST APIs using FastAPI and optimized database indexing in PostgreSQL"
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors resize-none"
                          ></textarea>
                        </div>
                      </div>
                      <button type="button" className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-white transition-colors bg-slate-50/50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Work Experience
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </section>

            {/* 3. Additional Information */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">
                3. Additional Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Salary</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 font-medium">
                      RM
                    </div>
                    <input type="text" placeholder="5000" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expected Salary</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 font-medium">
                      RM
                    </div>
                    <input type="text" placeholder="6000" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Availability / Notice Period</label>
                  <div className="relative">
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors">
                      <option>Immediate</option>
                      <option>1 Week</option>
                      <option>2 Weeks</option>
                      <option selected>1 Month</option>
                      <option>2 Months</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Professional Portfolios & Links</label>
                <div className="space-y-3">
                  {portfolios.map((portfolio, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input 
                        type="url" 
                        placeholder="e.g., https://github.com/yourprofile" 
                        value={portfolio}
                        onChange={(e) => updatePortfolio(index, e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                      />
                      {index === portfolios.length - 1 ? (
                        <button 
                          type="button" 
                          onClick={addPortfolio}
                          className="w-11 h-11 flex-shrink-0 rounded-lg bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => removePortfolio(index)}
                          className="w-11 h-11 flex-shrink-0 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Other Related Documents */}
            <section className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">
                4. Other Related Documents
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Cover Letter, Academic Transcript, etc.</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      multiple
                      accept=".pdf,.doc,.docx" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleOtherDocsUpload}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400 mb-3 group-hover:text-[#1d4ed8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">Click or drag to upload related documents</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOC, or DOCX format</p>
                    </div>
                  </div>
                </div>

                {otherDocs.length > 0 && (
                  <div className="space-y-3">
                    {otherDocs.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#1d4ed8] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm font-medium text-slate-800">{doc}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeOtherDoc(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Submit */}
            <div className="pt-4 pb-4">
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white py-4 rounded-xl font-medium text-base transition-colors shadow-md shadow-slate-800/20"
              >
                Confirm & Submit Application
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </main>
  );
}
