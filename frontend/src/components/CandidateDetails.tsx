import React from 'react';

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

export default function CandidateDetails({ onBack }: { onBack: () => void }) {
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
            <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-1 tracking-tight">Sarah Johnson</h1>
            <p className="text-slate-500 text-lg">Senior Frontend Developer</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-serif font-bold text-[#16a34a] leading-none mb-1">92%</div>
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
                    <span className="text-xl font-serif font-bold text-[#0f172a]">95%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-[#1e293b] h-3 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400">3/4 required skills matched</p>
                </div>

                {/* Education */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-[#0f172a]">Education Match</span>
                    <span className="text-xl font-serif font-bold text-[#0f172a]">90%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-[#1e293b] h-3 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400">Bachelor's degree in relevant field</p>
                </div>

                {/* Experience */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-[#0f172a]">Experience Match</span>
                    <span className="text-xl font-serif font-bold text-[#0f172a]">90%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-[#1e293b] h-3 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400">7 years exceeds 5+ years requirement</p>
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
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">React</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">TypeScript</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">Node.js</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-[#0f172a] font-semibold mb-4">
                    <XCircleIcon /> Missing Skills
                  </div>
                  <div className="flex gap-2 flex-wrap ml-7">
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full border border-red-100">CSS</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-[#0f172a] font-semibold mb-4">
                    <RibbonIcon /> Additional Skills
                  </div>
                  <div className="flex gap-2 flex-wrap ml-7">
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-full border border-slate-200">GraphQL</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-full border border-slate-200">AWS</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-full border border-slate-200">Docker</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Sidebar Column (Right) */}
          <div className="space-y-6">
            
            {/* Contact Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Contact Information</h3>
              <div className="space-y-5">
                <div className="flex items-start">
                  <MailIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Email</div>
                    <div className="text-sm font-medium text-slate-800">sarah.j@email.com</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Phone</div>
                    <div className="text-sm font-medium text-slate-800">+1 (555) 123-4567</div>
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
                    <div className="text-sm font-medium text-slate-800 leading-tight">BS Computer Science, Stanford University</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <ExperienceIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Experience</div>
                    <div className="text-sm font-medium text-slate-800">7 years</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <DocumentIcon />
                  <div className="ml-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Applied</div>
                    <div className="text-sm font-medium text-slate-800">April 20, 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm text-left">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] mb-6">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Send Email
                </button>
                <button className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Download Resume
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
