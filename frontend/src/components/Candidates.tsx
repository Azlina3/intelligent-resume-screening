import React from 'react';

const candidatesData = [
  { id: 1, name: 'Alex Turner', email: 'alex@email.com', job: 'Senior Frontend Engineer', status: 'Shortlisted', match: 92 },
  { id: 2, name: 'Priya Sharma', email: 'priya@email.com', job: 'Senior Frontend Engineer', status: 'Shortlisted', match: 87 },
  { id: 3, name: 'Marcus Lee', email: 'marcus@email.com', job: 'Senior Frontend Engineer', status: 'Processed', match: 71 },
  { id: 4, name: 'Sarah Johnson', email: 'sarah.j@email.com', job: 'Product Manager', status: 'Shortlisted', match: 89 },
  { id: 5, name: 'David Chen', email: 'david.c@email.com', job: 'UX Designer', status: 'Processed', match: 76 },
  { id: 6, name: 'Emily Rodriguez', email: 'emily.r@email.com', job: 'Backend Engineer', status: 'Processed', match: 68 },
];

export default function Candidates() {
  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-6xl mx-auto xl:mx-0">
        
        {/* Header */}
        <header className="mb-10 text-left">
          <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Candidates</h1>
          <p className="text-slate-500 text-[15px]">8 total applicants across all jobs</p>
        </header>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="w-full pl-10 pr-4 py-2 border-none bg-transparent text-sm focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              </div>
              <select className="pl-9 pr-8 py-2 text-sm text-slate-700 bg-transparent border-none appearance-none focus:outline-none cursor-pointer">
                <option>All Statuses</option>
                <option>Shortlisted</option>
                <option>Processed</option>
              </select>
            </div>
            
            <div className="relative border-l border-slate-200 pl-4">
              <select className="pr-8 py-2 text-sm text-slate-700 bg-transparent border-none appearance-none focus:outline-none cursor-pointer font-medium">
                <option>All Jobs</option>
                <option>Senior Frontend Engineer</option>
                <option>Product Manager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors">Pending (1)</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors">Processed (3)</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors">Shortlisted (4)</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors">Rejected (0)</button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 text-left">
            <div className="col-span-4 pl-2">Candidate</div>
            <div className="col-span-4">Job</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Match</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {candidatesData.map((candidate) => (
              <div key={candidate.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-50/50 transition-colors text-left cursor-pointer group">
                <div className="col-span-4 pl-2">
                  <div className="font-semibold text-slate-800 text-[15px]">{candidate.name}</div>
                  <div className="text-slate-500 text-sm">{candidate.email}</div>
                </div>
                <div className="col-span-4 text-slate-600 text-[14px]">
                  {candidate.job}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    candidate.status === 'Shortlisted' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {candidate.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center pr-4">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mr-3">
                    <div 
                      className={`h-1.5 rounded-full ${candidate.match >= 80 ? 'bg-[#16a34a]' : candidate.match >= 60 ? 'bg-[#3b82f6]' : 'bg-slate-400'}`} 
                      style={{ width: `${candidate.match}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold ${candidate.match >= 80 ? 'text-[#16a34a]' : candidate.match >= 60 ? 'text-[#3b82f6]' : 'text-slate-500'}`}>
                    {candidate.match}%
                  </span>
                  <svg className="w-4 h-4 ml-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
