import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { evaluateCandidateMatch } from '../utils/MatchingEngine';

export default function JobForm() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [jobDetails, setJobDetails] = useState<any>(null);
  const [jobRequirements, setJobRequirements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Extracted Data State
  const [fullName, setFullName] = useState("");
  const [idNo, setIdNo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [highestEducation, setHighestEducation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [education, setEducation] = useState<any>(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState<any>(null);
  const [currentSalary, setCurrentSalary] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [availability, setAvailability] = useState("1 Month");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  const [portfolios, setPortfolios] = useState(["", ""]);

  const [otherDocs, setOtherDocs] = useState<File[]>([]);
  
  const handleOtherDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setOtherDocs([...otherDocs, ...Array.from(e.target.files)]);
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
        
        let currentStatus = jobData.job_status;
        if (currentStatus === 'active' && jobData.application_deadline) {
          const diffTime = new Date(jobData.application_deadline).getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 0) {
             currentStatus = 'closed';
             supabase.from('job').update({ job_status: 'closed' }).eq('job_id', jobId).then();
          }
        }
        
        if (currentStatus === 'closed' || currentStatus === 'archived' || currentStatus === 'draft') {
          setIsClosed(true);
        }
        
        setJobDetails(jobData);

        const { data: reqData, error: reqError } = await supabase
          .from('job_requirement')
          .select('*')
          .eq('job_id', jobId);
          
        if (reqError) throw reqError;
        setJobRequirements(reqData || []);
        
      } catch (error) {
        console.error("Error fetching job data:", error);
        // If RLS hides the job because it's no longer 'active', the query will fail.
        // We treat any fetch failure as "closed or not found".
        setIsClosed(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobData();
  }, [jobId]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeName(file.name);
      setResumeFile(file);
      setIsLoadingResume(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = "Failed to parse resume";
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {}
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.full_name) setFullName(data.full_name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.education) {
          setHighestEducation(data.education.raw_title);
          setEducation(data.education);
        }
        if (data.calculated_metrics) {
          setCalculatedMetrics(data.calculated_metrics);
          setYearsOfExperience(Math.round((data.calculated_metrics.total_epe_months / 12) * 10) / 10);
        }
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
      } catch (error: any) {
        console.error("Error uploading resume:", error);
        alert(`Failed to parse resume: ${error.message}`);
      } finally {
        setIsLoadingResume(false);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      alert("Please upload your resume first.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Check or Create Candidate
      let candidateId = "";
      const { data: existingCandidate } = await supabase
        .from('candidate')
        .select('candidate_id')
        .eq('email', email)
        .maybeSingle();

      if (existingCandidate) {
        candidateId = existingCandidate.candidate_id;
      } else {
        const { data: newCandidate, error: candidateError } = await supabase
          .from('candidate')
          .insert({ name: fullName, id_no: idNo, email: email, phone: phone })
          .select()
          .single();
        if (candidateError) throw new Error("Candidate Error: " + candidateError.message);
        candidateId = newCandidate.candidate_id;
      }

      // 2. Upload Resume to Storage
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${candidateId}-${Date.now()}.${fileExt}`;
      let resumeUrl = "";

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError.message);
        alert(`Failed to upload resume to Storage. Please ensure you have created a public bucket named 'resumes' and enabled INSERT policies for public users. Error: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        resumeUrl = publicUrlData.publicUrl;
      }

      // 2.5 Upload Profile Photo (if exists)
      let photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
      if (profilePhoto) {
        const photoExt = profilePhoto.name.split('.').pop();
        const photoName = `photo-${candidateId}-${Date.now()}.${photoExt}`;
        const { error: photoUploadError } = await supabase.storage
          .from('applicant-images')
          .upload(photoName, profilePhoto);
        
        if (!photoUploadError) {
          const { data: photoData } = supabase.storage
            .from('applicant-images')
            .getPublicUrl(photoName);
          photoUrl = photoData.publicUrl;
        }
      }

      // 2.7 Upload Other Related Docs
      const otherDocUrls: string[] = [];
      for (const doc of otherDocs) {
        const docExt = doc.name.split('.').pop();
        const docName = `doc-${candidateId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${docExt}`;
        const { error: docUploadError } = await supabase.storage
          .from('related_docs')
          .upload(docName, doc);
          
        if (!docUploadError) {
           const { data: docData } = supabase.storage.from('related_docs').getPublicUrl(docName);
           otherDocUrls.push(docData.publicUrl);
        }
      }

      // 3. Create Application Record
      const appReference = `APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const applicationId = crypto.randomUUID();
      
      const { error: appError } = await supabase
        .from('application')
        .insert({
          application_id: applicationId,
          candidate_id: candidateId,
          job_id: parseInt(jobId || "0"),
          applicant_image: photoUrl,
          resume_file: resumeUrl,
          application_reference: appReference,
          application_status: 'Received',
          current_salary: currentSalary ? parseFloat(currentSalary) : 0,
          expected_salary: expectedSalary ? parseFloat(expectedSalary) : 0,
          availability: availability,
          highest_education: highestEducation,
          years_of_experience: Math.round(Number(yearsOfExperience) || 0),
          portfolio_link: JSON.stringify(portfolios.filter(p => p.trim() !== "")),
          work_experience: workExperiences,
          language: languages,
          achievement: achievements,
          other_docs: otherDocUrls
        })

      if (appError) throw new Error("Application Error: " + appError.message);

      // 3.5 Calculate and Insert Score
      const allCandidateSkills = [...technicalSkills, ...softSkills];
      const allCandidateLanguages = languages.map((l: any) => l.language || l.name);
      const everythingToEmbed = [...allCandidateSkills, ...allCandidateLanguages, highestEducation].filter(Boolean);
      
      let candidateEmbeddings: number[][] = [];
      if (everythingToEmbed.length > 0) {
        const embedRes = await fetch("http://localhost:8000/api/embed-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills: everythingToEmbed })
        });
        if (!embedRes.ok) throw new Error("Failed to embed candidate skills.");
        const embedData = await embedRes.json();
        candidateEmbeddings = embedData.embeddings;
      }
      
      const embeddedSkills = everythingToEmbed.map((name, i) => ({
        name,
        embedding: candidateEmbeddings[i]
      }));

      const candidateProfile = {
        skills: { technical: technicalSkills, soft: softSkills },
        languages: languages,
        education: education,
        calculated_metrics: calculatedMetrics,
        years_of_experience: yearsOfExperience,
        embedded_skills: embeddedSkills
      };
      
      const jobConfig = {
        minTotalExpYears: jobDetails?.min_total_experience || 0,
        minRelevantExpYears: jobDetails?.min_relevant_experience || 0,
        academicEquivalent: jobDetails?.equivalent_experience_accepted || false,
        minEduLevel: jobDetails?.education_level || "bachelor",
        strictEducationMatch: jobDetails?.strict_education_match || false
      };

      const { finalPercentage, breakdown } = evaluateCandidateMatch(
        jobRequirements,
        jobConfig,
        candidateProfile
      );

      const scoreId = crypto.randomUUID();
      const { error: scoreError } = await supabase
        .from('score')
        .insert([{
          score_id: scoreId,
          application_id: applicationId,
          total_score: finalPercentage,
          rank: 1
        }]);
        
      if (!scoreError) {
        await supabase
          .from('score_breakdown')
          .insert([
            { score_id: scoreId, criteria: 'Mandatory Requirements', score_value: breakdown.mandatoryPoints },
            { score_id: scoreId, criteria: 'Optional Requirements', score_value: breakdown.optionalPoints },
            { score_id: scoreId, criteria: 'Experience Match', score_value: breakdown.experiencePoints },
            { score_id: scoreId, criteria: 'Education Match', score_value: breakdown.educationPoints }
          ]);
      }

      // 4. Insert Candidate Data
      const candidateDataToInsert: any[] = [];
      
      technicalSkills.forEach(skill => {
        const embedObj = embeddedSkills.find(s => s.name === skill);
        candidateDataToInsert.push({ application_id: applicationId, type_id: 1, extracted_value: skill, embedding: embedObj?.embedding });
      });
      softSkills.forEach(skill => {
        const embedObj = embeddedSkills.find(s => s.name === skill);
        candidateDataToInsert.push({ application_id: applicationId, type_id: 2, extracted_value: skill, embedding: embedObj?.embedding });
      });
      // Note: Work Experiences, Languages, and Achievements are temporarily not inserted 
      // into candidate_data to avoid foreign key constraint errors since type_id 4, 5, 6 
      // do not exist in the requirement_type table. We will discuss the best schema for these!

      if (candidateDataToInsert.length > 0) {
        const { error: dataError } = await supabase
          .from('extracted_data')
          .insert(candidateDataToInsert);
        if (dataError) console.warn("Candidate Data Error:", dataError.message);
      }

      alert(`Application submitted successfully!\n\nYour Application Reference is: ${appReference}\nPlease save this code to track your application status later.`);
      navigate('/track-status');

    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-slate-500 font-medium text-lg">Loading Job Details...</p>
      </main>
    );
  }

  if (isClosed) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0f172a] mb-3">Position Closed</h1>
          <p className="text-slate-500 mb-2">We are no longer accepting applications for this position. Thank you for your interest.</p>
        </div>
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

          <form className="space-y-12" onSubmit={handleSubmit}>
            
            {/* Document Upload */}
            <section>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume</label>
                  {isLoadingResume ? (
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
                        <p className="text-xs text-slate-500 mt-1">PDF format only</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Profile Photo (Optional)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handlePhotoUpload}
                    />
                    <div className="flex flex-col items-center justify-center">
                      {photoPreview ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-[#1d4ed8]">
                           <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <svg className="w-8 h-8 text-slate-400 mb-3 group-hover:text-[#1d4ed8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
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
                  <input type="text" value={idNo} onChange={(e) => setIdNo(e.target.value)} placeholder="e.g., 020405-04-XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
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
                        {education && (
                          <div className="mt-2 text-xs text-slate-500 bg-white p-2 border border-slate-100 rounded">
                            <span className="font-semibold">AI Normalized:</span> {education.normalized_category} (Relevance: {education.semantic_relevance_score})
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Total Years of Experience (EPE)</label>
                        <input 
                          type="number" 
                          value={yearsOfExperience} 
                          onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : "")} 
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                        />
                        {calculatedMetrics && (
                          <div className="mt-2 text-xs text-slate-500 bg-white p-2 border border-slate-100 rounded">
                            <span className="font-semibold">AI Calculated EPE:</span> {calculatedMetrics.total_epe_months} months
                          </div>
                        )}
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
                                    <input type="number" value={we.duration_months || ""} onChange={(e) => {
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
                    <input type="number" value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} placeholder="5000" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expected Salary</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 font-medium">
                      RM
                    </div>
                    <input type="number" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="6000" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Availability / Notice Period</label>
                  <div className="relative">
                    <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors">
                      <option value="Immediate">Immediate</option>
                      <option value="1 Week">1 Week</option>
                      <option value="2 Weeks">2 Weeks</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Other Related Files (Optional)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleOtherDocsUpload}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400 mb-3 group-hover:text-[#1d4ed8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">Click or drag to upload additional documents</p>
                      <p className="text-xs text-slate-400 mt-1">e.g., Cover letters, certifications</p>
                    </div>
                  </div>
                  {otherDocs.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {otherDocs.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-sm text-slate-700 truncate">{doc.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeOtherDoc(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-4 pb-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white py-4 rounded-xl font-medium text-base transition-colors shadow-md shadow-slate-800/20 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Application..." : "Confirm & Submit Application"}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </main>
  );
}
