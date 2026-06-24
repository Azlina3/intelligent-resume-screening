import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function JobApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobTitle = location.state?.jobTitle || "Senior Frontend Developer";

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  
  // Extracted Data State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [highestEducation, setHighestEducation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  const [portfolios, setPortfolios] = useState(["", ""]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeName(file.name);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse resume");
        }

        const data = await response.json();
        
        // Populate state
        if (data.full_name) setFullName(data.full_name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.highest_education) setHighestEducation(data.highest_education);
        if (data.years_of_experience) setYearsOfExperience(data.years_of_experience);
        if (data.skills?.technical) setTechnicalSkills(data.skills.technical);
        if (data.skills?.soft) setSoftSkills(data.skills.soft);
        if (data.work_experience) setWorkExperiences(data.work_experience);
        if (data.portfolio_links && data.portfolio_links.length > 0) {
          const combined = [...data.portfolio_links];
          if (combined.length < 2) combined.push(""); // Keep an empty slot for UI
          setPortfolios(combined);
        }
        if (data.languages) setLanguages(data.languages);
        if (data.achievements) setAchievements(data.achievements);

        setResumeUploaded(true);
      } catch (error) {
        console.error("Error uploading resume:", error);
        alert("Failed to parse resume. Please ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeTechnicalSkill = (indexToRemove: number) => {
    setTechnicalSkills(technicalSkills.filter((_, index) => index !== indexToRemove));
  };

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim() !== "") {
      setTechnicalSkills([...technicalSkills, newTechnicalSkill.trim()]);
      setNewTechnicalSkill("");
    }
  };

  const removeSoftSkill = (indexToRemove: number) => {
    setSoftSkills(softSkills.filter((_, index) => index !== indexToRemove));
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim() !== "") {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill("");
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
            <p className="text-slate-500 text-base">Apply for {jobTitle} position</p>
          </div>

          <form className="space-y-12">
            
            {/* Document Upload */}
            <section>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume</label>
                  {isLoading ? (
                    <div className="border-2 border-dashed border-[#1d4ed8]/30 bg-[#1d4ed8]/5 rounded-xl p-8 text-center flex flex-col items-center justify-center animate-pulse">
                      <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-medium text-slate-700">AI is reading and extracting your resume...</p>
                      <p className="text-xs text-slate-500 mt-1">This takes just a few seconds</p>
                    </div>
                  ) : !resumeUploaded ? (
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
                        <p className="text-xs text-slate-500 mt-1">Extraction Complete</p>
                      </div>
                    </div>
                  )}
                </div>

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
              </div>
            </section>

            {/* 1. Personal Information */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">
                1. Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Identification / Passport Number</label>
                  <input type="text" placeholder="e.g., 020405-04-XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., john@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +60 12-345 6789" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                </div>
              </div>
            </section>

            {/* 2. Professional Background & Expertise */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">
                2. Professional Background & Expertise
              </h2>
              
              <div className="space-y-6">
                {resumeUploaded && (
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Review Extracted Data (Verify & Edit If Necessary)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Highest Education Level</label>
                        <input 
                          type="text" 
                          value={highestEducation} 
                          onChange={(e) => setHighestEducation(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Total Years of Experience</label>
                        <input 
                          type="number" 
                          value={yearsOfExperience} 
                          onWheel={(e) => (e.target as HTMLElement).blur()}
                          onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : "")} 
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                        />
                      </div>
                    </div>

                    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Technical Skills</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {technicalSkills.map((skill, index) => (
                            <div key={index} className="flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                              {skill}
                              <button type="button" onClick={() => removeTechnicalSkill(index)} className="ml-2 text-green-600 hover:text-green-900 focus:outline-none">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Add technical skill" value={newTechnicalSkill} onChange={(e) => setNewTechnicalSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())} className="flex-1 max-w-xs bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                          <button type="button" onClick={addTechnicalSkill} className="w-10 h-10 rounded-lg bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Soft Skills</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {softSkills.map((skill, index) => (
                            <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                              {skill}
                              <button type="button" onClick={() => removeSoftSkill(index)} className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Add soft skill" value={newSoftSkill} onChange={(e) => setNewSoftSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())} className="flex-1 max-w-xs bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                          <button type="button" onClick={addSoftSkill} className="w-10 h-10 rounded-lg bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-slate-700 mb-4">Work Experiences Breakdown</label>
                      <div className="space-y-4 mb-4">
                        {workExperiences.length > 0 ? workExperiences.map((we, index) => (
                          <div key={index} className="p-5 bg-white border border-slate-200 rounded-xl relative group">
                            <button type="button" onClick={() => setWorkExperiences(workExperiences.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company</label>
                                    <input type="text" value={we.company || ""} onChange={(e) => {
                                        const newWE = [...workExperiences];
                                        newWE[index].company = e.target.value;
                                        setWorkExperiences(newWE);
                                    }} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                                    <input type="text" value={we.role || ""} onChange={(e) => {
                                        const newWE = [...workExperiences];
                                        newWE[index].role = e.target.value;
                                        setWorkExperiences(newWE);
                                    }} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration (Months)</label>
                                    <input type="number" onWheel={(e) => (e.target as HTMLElement).blur()} value={we.duration_months || ""} onChange={(e) => {
                                        const newWE = [...workExperiences];
                                        newWE[index].duration_months = e.target.value ? Number(e.target.value) : "";
                                        setWorkExperiences(newWE);
                                    }} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-800" />
                                </div>
                            </div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Summary / Responsibilities</label>
                            <textarea 
                              rows={3} 
                              value={we.summary || ""}
                              onChange={(e) => {
                                  const newWE = [...workExperiences];
                                  newWE[index].summary = e.target.value;
                                  setWorkExperiences(newWE);
                              }}
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors resize-none"
                            ></textarea>
                          </div>
                        )) : (
                           <div className="p-5 bg-white border border-slate-200 rounded-xl text-center text-sm text-slate-500">No work experience extracted.</div>
                        )}
                      </div>
                      <button type="button" onClick={() => setWorkExperiences([...workExperiences, { company: "", role: "", duration_months: "", summary: "" }])} className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-white transition-colors bg-slate-50/50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Work Experience
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Languages</label>
                            {languages.length > 0 ? (
                                <div className="space-y-2 mb-3">
                                    {languages.map((lang, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            <span className="text-sm font-medium text-slate-800">{lang.language}</span>
                                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{lang.proficiency}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 mb-3">No languages extracted.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Key Achievements</label>
                            {achievements.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                                    {achievements.map((ach, idx) => (
                                        <li key={idx}>{ach}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400">No achievements extracted.</p>
                            )}
                        </div>
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
