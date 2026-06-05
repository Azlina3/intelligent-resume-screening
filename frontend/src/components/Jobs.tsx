export default function Jobs() {
  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-6xl mx-auto xl:mx-0">
        <div className="flex justify-between items-start mb-8">
          <header className="text-left">
            <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Job Openings</h1>
            <p className="text-slate-500 text-[15px]">Manage your active job postings and consult archived hiring cycles.</p>
          </header>
          <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors shadow-sm">
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

        {/* Active Positions Section */}
        <section className="mb-12">
          <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6 text-left">Active Positions</h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
            {/* Job Card 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#1d4ed8] mr-3"></div>
                  <h3 className="text-xl font-serif font-bold text-[#0f172a]">Senior Frontend Developer</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#1d4ed8] text-white text-xs font-medium rounded-full">Active</span>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    ⚙️
                  </button>
                </div>
              </div>
              
              <div className="text-slate-500 text-sm mb-4">Engineering</div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">📍</span>
                  Remote
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">👥</span>
                  45 applicants (<span className="text-[#1d4ed8] font-medium mx-1">18 unreviewed</span> • <span className="text-[#16a34a] font-medium ml-1">12 shortlisted</span>)
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">🕒</span>
                  Posted 2 days ago • Closes in <span className="text-orange-500 font-medium ml-1">3 days</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
                  View Applicants
                </button>
                <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                  <span className="mr-2">📄</span> Copy Application Link
                </button>
              </div>
            </div>

            {/* Job Card 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#1d4ed8] mr-3"></div>
                  <h3 className="text-xl font-serif font-bold text-[#0f172a]">Product Manager</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#1d4ed8] text-white text-xs font-medium rounded-full">Active</span>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    ⚙️
                  </button>
                </div>
              </div>
              
              <div className="text-slate-500 text-sm mb-4">Product</div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">📍</span>
                  New York, NY
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">👥</span>
                  32 applicants (<span className="text-[#1d4ed8] font-medium mx-1">12 unreviewed</span> • <span className="text-[#16a34a] font-medium ml-1">5 shortlisted</span>)
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">🕒</span>
                  Posted 1 week ago • Closes in <span className="text-orange-500 font-medium ml-1">5 days</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
                  View Applicants
                </button>
                <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                  <span className="mr-2">📄</span> Copy Application Link
                </button>
              </div>
            </div>

            {/* Job Card 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold text-[#0f172a] pl-5">UX Designer</h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#1d4ed8] text-white text-xs font-medium rounded-full">Active</span>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    ⚙️
                  </button>
                </div>
              </div>
              
              <div className="text-slate-500 text-sm mb-4 pl-5">Design</div>
              
              <div className="space-y-2 mb-6 pl-5">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">📍</span>
                  San Francisco, CA
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">👥</span>
                  28 applicants (<span className="text-[#1d4ed8] font-medium mx-1">8 unreviewed</span> • <span className="text-[#16a34a] font-medium ml-1">6 shortlisted</span>)
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">🕒</span>
                  Posted 3 days ago • Closes in <span className="text-orange-500 font-medium ml-1">10 days</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
                  View Applicants
                </button>
                <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                  <span className="mr-2">📄</span> Copy Application Link
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Archived Positions Section */}
        <section className="mb-12">
          <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6 text-left">Archived Positions</h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
            {/* Archived Card 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold text-[#0f172a] pl-5">Backend Engineer</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Archived</span>
              </div>
              
              <div className="text-slate-500 text-sm mb-4 pl-5">Engineering</div>
              
              <div className="space-y-2 mb-6 pl-5">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">📍</span>
                  Remote
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">👥</span>
                  51 historical applicants
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">🕒</span>
                  Hiring Cycle: Jan 2026 - Mar 2026 (Closed)
                </div>
              </div>

              <div className="mt-auto">
                <button className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors mb-3">
                  View Historical Records
                </button>
                <p className="text-xs text-slate-400 px-1">Archived Record — Locked for data integrity.</p>
              </div>
            </div>

            {/* Archived Card 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold text-[#0f172a] pl-5">Data Analyst</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Archived</span>
              </div>
              
              <div className="text-slate-500 text-sm mb-4 pl-5">Analytics</div>
              
              <div className="space-y-2 mb-6 pl-5">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">📍</span>
                  Austin, TX
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">👥</span>
                  19 historical applicants
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-3 opacity-50">🕒</span>
                  Hiring Cycle: Dec 2025 - Feb 2026 (Closed)
                </div>
              </div>

              <div className="mt-auto">
                <button className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors mb-3">
                  View Historical Records
                </button>
                <p className="text-xs text-slate-400 px-1">Archived Record — Locked for data integrity.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
