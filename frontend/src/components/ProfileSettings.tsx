import { useState } from 'react';

export default function ProfileSettings({ userName }: { userName?: string }) {
  const [fullName, setFullName] = useState(userName || '');
  const [phone, setPhone] = useState('+60 12-345 6789');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-4xl mx-auto lg:mx-0">
        <header className="mb-8 text-left">
          <h1 className="text-[28px] font-serif font-bold text-[#0f172a] mb-2">Profile Settings</h1>
          <p className="text-slate-500 text-[15px]">Update your personal details and account preferences.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
          {/* Account Information Section */}
          <section className="mb-10">
            <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-6">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
                <input 
                  type="email" 
                  value="aida.hr@company.com"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-[15px] cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-2">Managed by your organization. Contact IT to change.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role / Job Title</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px] appearance-none"
                  defaultValue="hr_executive"
                >
                  <option value="hr_executive">HR Executive</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="hiring_manager">Hiring Manager</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 mb-10" />

          {/* Change Password Section */}
          <section className="mb-10">
            <h2 className="text-xl font-serif font-bold text-[#0f172a] mb-1">Change Password</h2>
            <p className="text-sm text-slate-400 mb-6">Leave these fields blank if you don't want to change your password.</p>
            
            <div className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                  />
                  <button className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                  />
                  <button className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                  />
                  <button className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
              Cancel
            </button>
            <button className="px-5 py-2.5 bg-[#1e293b] text-white rounded-lg hover:bg-slate-800 font-medium text-sm shadow-sm transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
