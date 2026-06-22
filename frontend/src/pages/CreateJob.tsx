import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { logActivity } from '../utils/activityLogger';

export default function CreateJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditing = !!jobId;
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  // Templates now act as a pre-fill rather than a strict lock
  const isFieldDisabled = false;

  // Basic Details State
  const [jobTitle, setJobTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  
  const [userRole, setUserRole] = useState<string | null>(null);

  // Candidate Background Criteria State
  const [minTotalExperience, setMinTotalExperience] = useState('');
  const [minRelevantExperience, setMinRelevantExperience] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptableDegrees, setAcceptableDegrees] = useState('');
  const [equivalentExperienceAccepted, setEquivalentExperienceAccepted] = useState(false);
  const [acceptPursuingEducation, setAcceptPursuingEducation] = useState(false);
  const [strictEducationMatch, setStrictEducationMatch] = useState(true);

  // Core Skill Requirements State (3 Distinct Cards)
  const [techSkills, setTechSkills] = useState([{ name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: 1 }]);
  const [softSkills, setSoftSkills] = useState([{ name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: 2 }]);
  const [domainSkills, setDomainSkills] = useState([{ name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: 3 }]);

  const [requiresTechAssessment, setRequiresTechAssessment] = useState(false);

  // Responsibilities State
  const [responsibilities, setResponsibilities] = useState([""]);

  // Departments from DB
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('job_department')
        .select('department_id, department_name')
        .neq('department_name', 'System Admin');

      if (data) {
        setDepartments(data);
      } else if (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();

    const fetchTemplates = async () => {
      const { data } = await supabase.from('job_template').select('template_id, template_name');
      if (data) setAvailableTemplates(data);
    };
    fetchTemplates();


    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: staffData } = await supabase
          .from('staff_user')
          .select('role')
          .eq('email', user.email)
          .single();
        
        if (staffData) {
          setUserRole(staffData.role);
        } else {
          setUserRole(user.user_metadata?.role);
        }
      }
    };
    fetchRole();

    if (isEditing) {
      const fetchJobDetails = async () => {
        const { data: job } = await supabase
          .from('job')
          .select('*, job_requirement(*)')
          .eq('job_id', jobId)
          .single();
        
        if (job) {
          setJobTitle(job.job_title || '');
          setDepartmentId(job.department_id?.toString() || '');
          setLocation(job.location || '');
          setEmploymentType(job.employment_type || '');
          setMinSalary(job.min_salary?.toString() || '');
          setMaxSalary(job.max_salary?.toString() || '');
          setApplicationDeadline(job.application_deadline || '');
          setMinTotalExperience(job.min_total_experience?.toString() || '');
          setMinRelevantExperience(job.min_relevant_experience?.toString() || '');
          setEducationLevel(job.education_level || '');
          setEquivalentExperienceAccepted(job.equivalent_experience_accepted || false);
          setAcceptPursuingEducation(job.accept_pursuing_education || false);
          setStrictEducationMatch(job.strict_education_match || false);
          setRequiresTechAssessment(job.requires_tech_assessment || false);
          setResponsibilities(job.responsibilities || ['']);

          if (job.job_requirement) {
            const reqs = job.job_requirement;
            
            // Helper to deduplicate by name
            const uniqueByName = (arr: any[]) => {
              const seen = new Set();
              return arr.filter(item => {
                if (seen.has(item.name.toLowerCase())) return false;
                seen.add(item.name.toLowerCase());
                return true;
              });
            };

            const tech = uniqueByName(reqs.filter((r: any) => r.type_id === 1).map((r: any) => ({ name: r.requirement_name, proficiency: r.proficiency_level, priority: r.is_mandatory ? 'Mandatory' : 'Preferred', type_id: 1 })));
            const soft = uniqueByName(reqs.filter((r: any) => r.type_id === 2).map((r: any) => ({ name: r.requirement_name, proficiency: r.proficiency_level, priority: r.is_mandatory ? 'Mandatory' : 'Preferred', type_id: 2 })));
            const domain = uniqueByName(reqs.filter((r: any) => r.type_id === 3).map((r: any) => ({ name: r.requirement_name, proficiency: r.proficiency_level, priority: r.is_mandatory ? 'Mandatory' : 'Preferred', type_id: 3 })));
            const degs = Array.from(new Set(reqs.filter((r: any) => r.type_id === 4).map((r: any) => r.requirement_name))).join(', ');

            if (tech.length > 0) setTechSkills(tech);
            if (soft.length > 0) setSoftSkills(soft);
            if (domain.length > 0) setDomainSkills(domain);
            if (degs) setAcceptableDegrees(degs);
          }
        }
      };
      fetchJobDetails();
    }
  }, [jobId, isEditing]);

  
  const handleTemplateSelection = async (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const { data: temp } = await supabase.from('job_template').select('*').eq('template_id', templateId).single();
    if (temp) {
      setJobTitle(temp.job_title || '');
      setDepartmentId(temp.department_id?.toString() || '');
      setLocation(temp.location || '');
      setEmploymentType(temp.employment_type || '');
      setMinSalary(temp.min_salary?.toString() || '');
      setMaxSalary(temp.max_salary?.toString() || '');
      setMinTotalExperience(temp.min_total_experience?.toString() || '');
      setMinRelevantExperience(temp.min_relevant_experience?.toString() || '');
      setEducationLevel(temp.education_level || '');
      setAcceptPursuingEducation(temp.accept_pursuing_education || false);
      setEquivalentExperienceAccepted(temp.equivalent_experience_accepted || false);
      setStrictEducationMatch(temp.strict_education_match || false);
      setRequiresTechAssessment(temp.requires_tech_assessment || false);
      setResponsibilities(temp.responsibilities || ['']);
    }

    const { data: reqs } = await supabase.from('job_template_requirement').select('*').eq('template_id', templateId);
    if (reqs) {
      const mapReqToSkill = (r: any) => ({
        name: r.requirement_name,
        proficiency: r.proficiency_level,
        priority: r.is_mandatory ? 'Mandatory' : 'Preferred',
        type_id: r.type_id
      });
      const tech = reqs.filter((r: any) => r.type_id === 1);
      const soft = reqs.filter((r: any) => r.type_id === 2);
      const domain = reqs.filter((r: any) => r.type_id === 3);

      if (tech.length > 0) setTechSkills(tech.map(mapReqToSkill));
      else setTechSkills([{ name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: 1 }]);
      
      if (soft.length > 0) setSoftSkills(soft.map(mapReqToSkill));
      else setSoftSkills([{ name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: 2 }]);
      
      if (domain.length > 0) setDomainSkills(domain.map(mapReqToSkill));
      else setDomainSkills([{ name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: 3 }]);

      const degs = reqs.filter((r: any) => r.type_id === 4);
      if (degs.length > 0) setAcceptableDegrees(degs.map((r: any) => r.requirement_name).join(', '));
      else setAcceptableDegrees('');
    }
  };

  const updateResponsibility = (index: number, value: string) => {
    const newReqs = [...responsibilities];
    newReqs[index] = value;
    setResponsibilities(newReqs);
  };

  const addResponsibility = () => {
    setResponsibilities([...responsibilities, ""]);
  };

  const removeResponsibility = (index: number) => {
    if (responsibilities.length > 1) {
      setResponsibilities(responsibilities.filter((_, i) => i !== index));
    }
  };

  // Generic Skill Handlers
  const updateSkill = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number, field: string, value: string) => {
    setter(prev => {
      const newSkills = [...prev];
      newSkills[index] = { ...newSkills[index], [field]: value };
      return newSkills;
    });
  };

  const addSkillRow = (setter: React.Dispatch<React.SetStateAction<any[]>>, typeId: number) => {
    setter(prev => [...prev, { name: '', proficiency: 'intermediate', priority: 'Mandatory', type_id: typeId }]);
  };

  const removeSkillRow = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number) => {
    setter(prev => {
      if (prev.length === 1) return prev; // Keep at least one row visually present
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (status: 'active' | 'draft') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to create a job.");
        return;
      }

      // Enforce Junior HR custom job rule
      // Fetch role directly to be absolutely sure we have it
      let currentRole = userRole;
      if (!currentRole) {
        const { data: staffData } = await supabase
          .from('staff_user')
          .select('role')
          .eq('email', user.email)
          .single();
        currentRole = staffData?.role || user.user_metadata?.role;
      }

      let finalStatus = status;
      // If it's a junior HR publishing a job without a template currently selected
      if (status === 'active' && currentRole === 'hr_junior' && !selectedTemplate) {
        finalStatus = 'pending_approval';
      }

      if (minSalary && maxSalary && parseFloat(maxSalary) <= parseFloat(minSalary)) {
        alert("Maximum Salary Budget must be greater than Minimum Salary Budget");
        return;
      }

      // 1. Prepare Job Payload
      const jobPayload = {
        user_id: user.id,
        job_title: jobTitle,
        department_id: departmentId ? parseInt(departmentId) : null,
        location: location,
        employment_type: employmentType,
        min_salary: minSalary ? parseFloat(minSalary) : null,
        max_salary: maxSalary ? parseFloat(maxSalary) : null,
        application_deadline: applicationDeadline || null,
        min_total_experience: minTotalExperience ? parseInt(minTotalExperience) : null,
        min_relevant_experience: minRelevantExperience ? parseInt(minRelevantExperience) : null,
        education_level: educationLevel,
        accept_pursuing_education: acceptPursuingEducation,
        equivalent_experience_accepted: equivalentExperienceAccepted,
        strict_education_match: strictEducationMatch,
        requires_tech_assessment: requiresTechAssessment,
        responsibilities: responsibilities.filter(r => r.trim() !== ''),
        job_status: finalStatus
      };

      console.log(`${isEditing ? 'Updating' : 'Inserting'} Job:`, jobPayload);

      let newJobId;

      if (isEditing) {
        const { error } = await supabase
          .from('job')
          .update(jobPayload)
          .eq('job_id', jobId);

        if (error) throw error;
        newJobId = jobId;

        // Delete old requirements before inserting new ones (bypass RLS via backend)
        const delRes = await fetch(`http://localhost:8000/api/job-requirements/${jobId}`, {
          method: 'DELETE'
        });
        if (!delRes.ok) throw new Error("Failed to clear old requirements");

      } else {
        const { data: jobData, error: jobError } = await supabase
          .from('job')
          .insert([jobPayload])
          .select()
          .single();

        if (jobError) throw jobError;
        newJobId = jobData.job_id;
      }

      // 2. Prepare Skills Payload (Unified Array from all 3 cards)
      const allSkills = [
        ...techSkills, 
        ...softSkills, 
        ...domainSkills
      ].filter(s => s.name.trim() !== '');

      const acceptableDegreesArray = acceptableDegrees.split(',').map(d => d.trim()).filter(Boolean);
      const itemsToEmbed = [...allSkills.map(s => s.name), ...acceptableDegreesArray];

      if (itemsToEmbed.length > 0) {
        // Fetch embeddings for all skills + degrees
        const embedRes = await fetch("http://localhost:8000/api/embed-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills: itemsToEmbed })
        });
        
        if (!embedRes.ok) {
          throw new Error("Failed to generate vector embeddings for skills.");
        }
        
        const embedData = await embedRes.json();
        const embeddings = embedData.embeddings;

        const skillsPayload = allSkills.map((skill, index) => ({
          job_id: newJobId,
          requirement_name: skill.name,
          proficiency_level: skill.proficiency,
          is_mandatory: skill.priority === 'Mandatory',
          type_id: skill.type_id,
          embedding: embeddings[index]
        }));

        const degreesPayload = acceptableDegreesArray.map((degree, index) => ({
          job_id: newJobId,
          requirement_name: degree,
          proficiency_level: 'intermediate',
          is_mandatory: true,
          type_id: 4,
          embedding: embeddings[allSkills.length + index]
        }));

        console.log("Inserting Requirements:", [...skillsPayload, ...degreesPayload]);

        const { error: skillsError } = await supabase
          .from('job_requirement')
          .insert([...skillsPayload, ...degreesPayload]);

        if (skillsError) throw skillsError;
      }

      const appLink = `${window.location.origin}/apply/${newJobId}`;

      try {
        await navigator.clipboard.writeText(appLink);
        if (finalStatus === 'pending_approval') {
           alert(`Job successfully submitted! Since it is a custom job, it is currently "Pending Approval" by a Senior HR. They will review it shortly.`);
        } else {
           alert(`Job successfully ${isEditing ? 'updated' : 'created'} as ${finalStatus}!\n\nThe application link has been copied to your clipboard:\n${appLink}`);
        }
      } catch (err) {
        if (finalStatus === 'pending_approval') {
           alert(`Job successfully submitted for approval!`);
        } else {
           alert(`Job successfully ${isEditing ? 'updated' : 'created'} as ${finalStatus}!\n\nApplication Link (copy this):\n${appLink}`);
        }
      }

      await logActivity(
        isEditing ? 'Job Post Updated' : 'New Job Post Created',
        `Job "${jobTitle}" was successfully ${isEditing ? 'updated' : 'created'} with status: ${finalStatus}.`,
        finalStatus === 'pending_approval' ? 'warning' : 'success'
      );

      navigate('/dashboard'); // or appropriate route
    } catch (error: any) {
      console.error("Error creating job:", error);
      alert("Failed to create job: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI helper for dynamic skill rows
  const renderSkillRow = (
    skill: any,
    index: number,
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    typeId: number,
    placeholder: string,
    isLast: boolean
  ) => (
    <div key={index} className="flex items-start gap-3">
      <div className="flex-1">
        <input
          type="text"
          placeholder={placeholder}
          value={skill.name}
          onChange={(e) => updateSkill(setter, index, 'name', e.target.value)}
          disabled={isFieldDisabled}
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        />
      </div>
      <div className="w-36">
        <div className="relative">
          <select
            value={skill.proficiency}
            onChange={(e) => updateSkill(setter, index, 'proficiency', e.target.value)}
            disabled={isFieldDisabled}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="entry">Entry</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      <div className="w-36">
        <div className="relative">
          <select
            value={skill.priority}
            onChange={(e) => updateSkill(setter, index, 'priority', e.target.value)}
            disabled={isFieldDisabled}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="Mandatory">Mandatory</option>
            <option value="Preferred">Preferred</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => removeSkillRow(setter, index)}
          disabled={isFieldDisabled}
          className="w-11 h-11 flex-shrink-0 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove row"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
        {isLast && (
          <button
            type="button"
            onClick={() => addSkillRow(setter, typeId)}
            disabled={isFieldDisabled}
            className="w-11 h-11 flex-shrink-0 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center hover:bg-[#1e40af] transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
            title="Add row"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-5xl">

        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-serif font-bold text-[#0f172a] mb-3 tracking-tight">{isEditing ? 'Edit Job Opening' : 'Create Job Opening'}</h1>
          <p className="text-slate-500 text-base">Define the explicit criteria, structure, and scoring parameters for your {isEditing ? 'existing' : 'new'} position.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form className="p-8 sm:p-10 text-left space-y-12" onSubmit={(e) => e.preventDefault()}>

            {/* 0. Template Selection */}
            {!isEditing && (
              <section className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-lg font-serif font-bold text-[#0f172a] mb-1">Use a Template</h2>
                    <p className="text-sm text-slate-500">Speed up your posting by using a pre-approved job template.</p>
                  </div>
                  <div className="w-1/2 relative">
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
                      onChange={(e) => handleTemplateSelection(e.target.value)}
                      value={selectedTemplate}
                    >
                      <option value="" disabled>Choose a template...</option>
                      {availableTemplates.map((t) => (
                        <option key={t.template_id} value={t.template_id}>
                          {t.template_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 1. Basic Details */}
            <section>
              <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={isFieldDisabled}
                    placeholder="e.g., Senior Frontend Developer"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <div className="relative">
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      disabled={isFieldDisabled}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Select department...</option>
                      {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isFieldDisabled}
                    placeholder="e.g., Remote, Hybrid, or New York, NY"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Employment Type</label>
                  <div className="relative">
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      disabled={isFieldDisabled}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Select type...</option>
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Salary Budget</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      min="0"
                      disabled={isFieldDisabled}
                      placeholder="Min"
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <span className="text-slate-400 font-medium">-</span>
                    <input
                      type="number"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      min="0"
                      disabled={isFieldDisabled}
                      placeholder="Max"
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                  {minSalary && maxSalary && parseFloat(maxSalary) <= parseFloat(minSalary) && (
                    <p className="text-red-500 text-xs mt-2 font-medium">Maximum budget must be greater than minimum budget.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    disabled={isFieldDisabled}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* 2. Candidate Background Criteria */}
            <section>
              <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6">Candidate Background Criteria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Experience Required</label>
                  <input
                    type="number"
                    value={minTotalExperience}
                    onChange={(e) => setMinTotalExperience(e.target.value)}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    min="0"
                    disabled={isFieldDisabled}
                    placeholder="Min Years"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Relevant Technology Experience</label>
                  <input
                    type="number"
                    value={minRelevantExperience}
                    onChange={(e) => setMinRelevantExperience(e.target.value)}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    min="0"
                    disabled={isFieldDisabled}
                    placeholder="Min Years"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Latest Education Level</label>
                  <div className="relative">
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      disabled={isFieldDisabled}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Select education level...</option>
                      <option value="no_requirement">No Requirement</option>
                      <option value="spm">SPM / O-Level</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-2 bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Education Flexibility</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <label className="flex items-start cursor-pointer">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptPursuingEducation}
                          onChange={(e) => setAcceptPursuingEducation(e.target.checked)}
                          disabled={isFieldDisabled}
                          className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="block bg-slate-200 w-10 h-6 rounded-full transition-colors peer-checked:bg-[#1d4ed8]"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-slate-700">Accept Currently Pursuing</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Allow candidates still studying this degree</span>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={equivalentExperienceAccepted}
                          onChange={(e) => setEquivalentExperienceAccepted(e.target.checked)}
                          disabled={isFieldDisabled}
                          className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="block bg-slate-200 w-10 h-6 rounded-full transition-colors peer-checked:bg-[#1d4ed8]"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-slate-700">Equivalent Experience</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Accept work experience in lieu of degree</span>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={strictEducationMatch}
                          onChange={(e) => setStrictEducationMatch(e.target.checked)}
                          disabled={isFieldDisabled}
                          className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="block bg-slate-200 w-10 h-6 rounded-full transition-colors peer-checked:bg-[#1d4ed8]"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-slate-700">Strict Domain Match</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Penalize unrelated fields of study</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Acceptable Fields of Study</label>
                  <input
                    type="text"
                    value={acceptableDegrees}
                    onChange={(e) => setAcceptableDegrees(e.target.value.replace(/[0-9]/g, ''))}
                    placeholder="e.g., Computer Science, Business, Economics (comma separated)"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* 3. Core Skill Requirements (Restructured) */}
            <section>
              <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6">Core Skill Requirements</h2>

              {/* Card 1: Technical Skills */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
                <h3 className="text-lg font-serif font-semibold text-[#0f172a] mb-6">Technical Skills</h3>
                <div className="flex gap-3 mb-3 px-1">
                  <div className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Name</div>
                  <div className="w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proficiency</div>
                  <div className="w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</div>
                  <div className="w-[96px]"></div>
                </div>
                <div className="space-y-4">
                  {techSkills.map((skill, index) =>
                    renderSkillRow(skill, index, setTechSkills, 1, "e.g., Python, React, AWS...", index === techSkills.length - 1)
                  )}
                </div>
              </div>

              {/* Card 2: Soft Skills */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
                <h3 className="text-lg font-serif font-semibold text-[#0f172a] mb-6">Soft Skills & Leadership</h3>
                <div className="flex gap-3 mb-3 px-1">
                  <div className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Name</div>
                  <div className="w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proficiency</div>
                  <div className="w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</div>
                  <div className="w-[96px]"></div>
                </div>
                <div className="space-y-4">
                  {softSkills.map((skill, index) =>
                    renderSkillRow(skill, index, setSoftSkills, 2, "e.g., Communication, Agile...", index === softSkills.length - 1)
                  )}
                </div>
              </div>

              {/* Card 3: Domain Knowledge */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
                <h3 className="text-lg font-serif font-semibold text-[#0f172a] mb-6">Domain Knowledge</h3>
                <div className="flex gap-3 mb-3 px-1">
                  <div className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Name</div>
                  <div className="w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proficiency</div>
                  <div className="w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</div>
                  <div className="w-[96px]"></div>
                </div>
                <div className="space-y-4">
                  {domainSkills.map((skill, index) =>
                    renderSkillRow(skill, index, setDomainSkills, 3, "e.g., GDPR, FinTech, HIPAA...", index === domainSkills.length - 1)
                  )}
                </div>
              </div>

              {/* Tech Assessment Flag */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-slate-300 rounded group-hover:border-[#1d4ed8] transition-colors mr-3">
                    <input
                      type="checkbox"
                      checked={requiresTechAssessment}
                      onChange={(e) => setRequiresTechAssessment(e.target.checked)}
                      disabled={isFieldDisabled}
                      className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity bg-[#1d4ed8] absolute inset-0 rounded-sm m-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isFieldDisabled ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>Include Technical Screening Flag (Requires coding/technical test)</span>
                </label>
              </div>
            </section>

            {/* 4. Job Responsibilities & Overview */}
            <section>
              <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6">Job Responsibilities & Overview</h2>
              <div className="space-y-3">
                {responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <input
                      type="text"
                      placeholder="e.g., Develop and maintain responsive web applications..."
                      value={resp}
                      onChange={(e) => updateResponsibility(index, e.target.value)}
                      disabled={isFieldDisabled}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                    {index === responsibilities.length - 1 ? (
                      <button
                        type="button"
                        onClick={addResponsibility}
                        disabled={isFieldDisabled}
                        className="w-11 h-11 flex-shrink-0 rounded-lg bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeResponsibility(index)}
                        disabled={isFieldDisabled}
                        className="w-11 h-11 flex-shrink-0 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </form>

          {/* Footer Actions */}
          <div className="bg-slate-50 border-t border-slate-200 p-6 sm:px-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleSubmit('active')}
                disabled={isSubmitting}
                className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Save & Publish' : 'Create & Generate Link')}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-6 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (jobId) {
                    window.open(`/apply/${jobId}`, '_blank');
                  } else {
                    alert("Please save the job as a draft or publish it to preview the job form.");
                  }
                }}
                className="text-[#1d4ed8] hover:text-[#1e40af] px-4 py-3 font-medium text-sm transition-colors"
              >
                Preview Job Form
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
