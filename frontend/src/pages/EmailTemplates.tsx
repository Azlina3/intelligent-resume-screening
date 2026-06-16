import React, { useState } from 'react';

import { supabase } from '../supabaseClient';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';

const TEMPLATES = [
  {
    id: 'interview',
    title: 'Interview Invitation Email',
    description: 'Interview Invitation - Senior Frontend Devel...',
    subject: 'Interview Invitation - [Position]',
    body: `Dear [Candidate Name],

Congratulations! We were genuinely impressed by your application for the [Position] role at TalentScreen Sdn. Bhd., and we are delighted to invite you to the next stage of our selection process — a formal interview with our engineering and leadership team.

Interview Details:
• Date: [Date]
• Time: [Time]
• Duration: Approximately 60 minutes
• Format: [Format]

[Meeting Link]

Please let us know if the proposed time works for you, or if you need to reschedule.

Best regards,
TalentScreen Recruitment Team`
  },
  {
    id: 'rejection',
    title: 'Rejection Email',
    description: 'Update on Your Application - [Position]',
    subject: 'Update on Your Application - [Position]',
    body: `Dear [Candidate Name],

Thank you sincerely for taking the time to apply for the [Position] role at TalentScreen Sdn. Bhd. and for your interest in joining our team.

After careful and thorough evaluation of all applications received, we regret to inform you that we have decided to move forward with candidates whose qualifications more closely align with our current requirements.

Please be assured that this decision was not made lightly. We were genuinely impressed by your background and we would warmly encourage you to apply for future opportunities that align with your skills and experience.

We wish you every success in your job search and future career endeavors.

Best regards,
TalentScreen Recruitment Team`
  },
  {
    id: 'follow-up',
    title: 'Follow-Up Status Email',
    description: 'Application Status Update - [Position]',
    subject: 'Application Status Update - [Position]',
    body: `Dear [Candidate Name],

Thank you for your application for the [Position] role at TalentScreen Sdn. Bhd.

We wanted to provide you with a brief status update. Your application is currently under active review by our hiring team. Given the volume of strong applications received, we appreciate your continued patience throughout this process.

You can check the real-time status of your application here: [Status Link]

If you have any questions in the meantime, please feel free to reply to this email.

Best regards,
TalentScreen Recruitment Team`
  },
  {
    id: 'successful',
    title: 'Offer / Successful Application Email',
    description: 'Congratulations - Offer for [Position]',
    subject: 'Offer of Employment - [Position]',
    body: `Dear [Candidate Name],

Congratulations! Following your recent interviews, we are thrilled to offer you the position of [Position] at TalentScreen Sdn. Bhd.

Our team was thoroughly impressed by your skills, experience, and the wonderful energy you brought to our conversations. We are confident you will be a fantastic addition to our company.

Please find the details of your offer and next steps in the attached official offer letter. We would appreciate it if you could review and let us know your decision by [Date].

If you have any questions or need further clarification, please do not hesitate to reach out.

We are excited about the prospect of you joining us!

Warm regards,
TalentScreen Recruitment Team`
  }
];

export default function EmailTemplates({ candidateData }: { candidateData?: any }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('interview');
  const [interviewMode, setInterviewMode] = useState<'Online' | 'Physical'>('Online');
  
  // Mapping state
  const [date, setDate] = useState('03/06/2026');
  const [time, setTime] = useState('10:00 AM');
  const [meetingLink, setMeetingLink] = useState('https://zoom.us/j/recruitment123');
  
  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  const renderBodyWithTokens = (text: string) => {
    // A simple regex to replace tokens like [Token] with styled spans
    const parts = text.split(/(\[[^\]]+\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        let displayValue = part;
        // Example mapping for the UI demo
        if (selectedTemplateId === 'interview') {
          if (part === '[Date]' && date) displayValue = date;
          if (part === '[Time]' && time) displayValue = time;
          if (part === '[Format]') {
            displayValue = interviewMode === 'Online' ? 'Video Conference' : 'In-Person';
          }
          if (part === '[Meeting Link]' && meetingLink) {
             displayValue = interviewMode === 'Online' ? `Meeting Link: ${meetingLink}` : `Location: ${meetingLink}`;
          }
        }
        if (selectedTemplateId === 'follow-up') {
          if (part === '[Status Link]') displayValue = 'https://talentscreen.app/status';
        }
        if (part === '[Candidate Name]') displayValue = candidateData?.name || '[Candidate Name]';
        if (part === '[Position]') displayValue = candidateData?.jobTitle || '[Position]';

        return (
          <span key={index} className="inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-sm font-medium mx-0.5 my-0.5">
            {displayValue}
          </span>
        );
      }
      // Replace newlines with <br /> for display
      return <span key={index} className="text-slate-700">{part.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ))}</span>;
    });
  };

  const compileEmailBody = () => {
    let body = selectedTemplate.body;
    body = body.replace(/\[Candidate Name\]/g, candidateData?.name || '[Candidate Name]');
    body = body.replace(/\[Position\]/g, candidateData?.jobTitle || '[Position]');
    if (selectedTemplateId === 'interview') {
      body = body.replace(/\[Date\]/g, date);
      body = body.replace(/\[Time\]/g, time);
      const formatText = interviewMode === 'Online' ? 'Video Conference' : 'In-Person';
      body = body.replace(/\[Format\]/g, formatText);
      const linkText = interviewMode === 'Online' ? `Meeting Link: ${meetingLink}` : `Location: ${meetingLink}`;
      body = body.replace(/\[Meeting Link\]/g, linkText);
    }
    if (selectedTemplateId === 'follow-up') {
      body = body.replace(/\[Status Link\]/g, 'https://talentscreen.app/status');
    }
    return body;
  };

  const handleCopyAndOutlook = () => {
    const body = compileEmailBody();
    navigator.clipboard.writeText(body);
    const subject = selectedTemplate.subject.replace(/\[Position\]/g, candidateData?.jobTitle || '[Position]');
    const mailtoLink = `mailto:${candidateData?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleMarkAsSent = async () => {
    if (!candidateData) {
      alert("Please select a candidate first.");
      return;
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      if (selectedTemplateId === 'interview') {
        if (!date || !time) {
          throw new Error("Please select a date and time for the interview.");
        }
        
        // Convert DD/MM/YYYY to MM/DD/YYYY for reliable Date parsing
        let parsedDateStr = `${date} ${time}`;
        if (date.includes('/')) {
           const [day, month, year] = date.split('/');
           parsedDateStr = `${month}/${day}/${year} ${time}`;
        }
        
        const scheduledDate = new Date(parsedDateStr);
        if (isNaN(scheduledDate.getTime())) {
          throw new Error("Invalid date or time value selected.");
        }

        const insertData = {
          application_id: candidateData.id,
          interviewer_id: userData.user.id,
          scheduled_at: scheduledDate.toISOString(),
          location_or_link: meetingLink,
          status: 'scheduled'
        };

        const { error } = await supabase.from('interview').insert([insertData]);
        if (error) throw error;
      }
      
      let newStatus = 'Received';
      if (selectedTemplateId === 'follow-up') newStatus = 'Under Review';
      if (selectedTemplateId === 'rejection') newStatus = 'Unsuccessful';
      if (selectedTemplateId === 'interview') newStatus = 'On Hold';
      if (selectedTemplateId === 'successful') newStatus = 'Successful';

      const { error: updateError } = await supabase
        .from('application')
        .update({ application_status: newStatus })
        .eq('application_id', candidateData.id);
        
      if (updateError) throw updateError;
      
      alert(`Email marked as sent and status updated to '${newStatus}'!`);
    } catch (error: any) {
      alert("Error saving interview: " + error.message);
    }
  };

  return (
    <div className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa] font-sans">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-serif font-bold text-[#0f172a] mb-3 tracking-tight">Email Templates</h1>
          <p className="text-slate-500 text-base">Compose and dispatch structured recruitment communications with smart parameter mapping.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">


          {/* Right Main Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 sm:px-8 sm:py-6 border-b border-slate-100">
              <h2 className="text-xl font-serif font-bold text-[#0f172a] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                Compose Email
              </h2>
            </div>

            <div className="p-6 sm:p-8 flex-1 space-y-7 overflow-y-auto">
              {/* Recipient Banner */}
              <div className="bg-[#f0f9ff] rounded-lg px-5 py-3 flex items-center gap-2 text-sm text-blue-800">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                <span className="font-semibold">Recipient:</span>
                <span>{candidateData ? `${candidateData.name} (${candidateData.email})` : 'Select a candidate from the Candidates list'}</span>
                {candidateData?.jobTitle && (
                  <>
                    <span className="mx-2 text-blue-300">•</span>
                    <span className="font-semibold">Position:</span>
                    <span>{candidateData.jobTitle}</span>
                  </>
                )}
              </div>

              {/* Select Template */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Template</label>
                <div className="relative">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors shadow-sm"
                  >
                    {TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Conditional Event Parameters Mapping for Interview Invitation */}
              {selectedTemplateId === 'interview' && (
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <div className="w-1 h-4 bg-blue-600 rounded"></div>
                      Interview Event Parameter Mapping
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Auto-maps to email body</div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">Mode of Interview</label>
                    <select
                      value={interviewMode}
                      onChange={(e) => setInterviewMode(e.target.value as 'Online' | 'Physical')}
                      className="w-full max-w-[200px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]"
                    >
                      <option value="Online">Online</option>
                      <option value="Physical">Physical</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Date Selection
                      </label>
                      <DatePicker
                        value={date}
                        onChange={(newDate) => setDate(newDate)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Time Selection
                      </label>
                      <TimePicker
                        value={time}
                        onChange={(newTime) => setTime(newTime)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        {interviewMode === 'Online' ? 'Meeting Link' : 'Location'}
                      </label>
                      <input
                        type="text"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder={interviewMode === 'Online' ? "https://..." : "123 Office Tower..."}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  readOnly
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none bg-slate-50/50"
                />
              </div>

              {/* Email Body */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-slate-700">Email Body</label>
                  <span className="text-xs text-slate-400">Tokens resolve as you fill the scheduler above</span>
                </div>
                <div className="w-full h-[320px] bg-white border border-slate-200 rounded-lg px-5 py-5 text-sm text-slate-800 overflow-y-auto leading-relaxed shadow-sm">
                  {renderBodyWithTokens(selectedTemplate.body)}
                </div>
              </div>



            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-white flex flex-wrap items-center gap-4">
              <button onClick={handleCopyAndOutlook} className="bg-[#0f172a] hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Copy Text & Open Outlook
              </button>
              <button onClick={handleMarkAsSent} className="border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Mark as Sent & Update Candidate Timeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
