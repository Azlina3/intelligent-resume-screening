import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseClient';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function ProfileSettings({ userName }: { userName?: string }) {
  const [fullName, setFullName] = useState(userName || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const newPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        setEmail(authData.user.email || '');
        setFullName(authData.user.user_metadata?.name || userName || '');
        setPhone(authData.user.phone || authData.user.user_metadata?.phone || '');
        
        const { data: staffData } = await supabase
          .from('staff_user')
          .select('role, name')
          .eq('user_id', authData.user.id)
          .single();
          
        if (staffData) {
          if (!authData.user.user_metadata?.name) {
            setFullName(staffData.name || '');
          }
          setRole(staffData.role || '');
        }
      }
    };
    fetchUserData();
  }, [userName]);

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setIsPasswordVerified(false);
    setPasswordError('');
  };

  const handleNewPasswordFocus = async () => {
    if (isPasswordVerified || !currentPassword) return;
    
    setVerifyingPassword(true);
    setPasswordError("");
    newPasswordRef.current?.blur(); // Temporarily remove focus to prevent typing while verifying

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: currentPassword,
    });

    setVerifyingPassword(false);

    if (signInError) {
      setPasswordError("Incorrect current password.");
      setIsPasswordVerified(false);
    } else {
      setIsPasswordVerified(true);
      newPasswordRef.current?.focus(); // Return focus on success
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      if (newPassword && newPassword !== confirmPassword) {
         throw new Error("New passwords do not match.");
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Not logged in");

      let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
      if (formattedPhone && !formattedPhone.startsWith('+')) {
         formattedPhone = '+' + formattedPhone;
      }

      const updateData: any = { 
        data: { name: fullName }
      };
      
      if (formattedPhone) {
        updateData.data.phone = formattedPhone;
      }
      if (newPassword) {
        if (!currentPassword) {
           throw new Error("Please enter your current password to set a new password.");
        }
        if (!isPasswordVerified) {
           throw new Error("Please verify your current password first.");
        }
        
        updateData.password = newPassword;
      }

      const { error: authError } = await supabase.auth.updateUser(updateData);
      if (authError) throw authError;

      const { error: dbError } = await supabase
        .from('staff_user')
        .update({ name: fullName })
        .eq('user_id', authData.user.id);

      if (dbError) throw dbError;

      setFeedback({ type: 'success', text: 'Profile updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <div className="max-w-4xl mx-auto lg:mx-0">
        <header className="mb-8 text-left">
          <h1 className="text-[28px] font-serif font-bold text-[#0f172a] mb-2">Profile Settings</h1>
          <p className="text-slate-500 text-[15px]">Update your personal details and account preferences.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
          {feedback && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-sans ${feedback.type === 'error' ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
              {feedback.text}
            </div>
          )}

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
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-[15px] cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-2">Managed by your organization. Contact IT to change.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+60123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                />
                <p className="text-xs text-slate-400 mt-1.5">Include country code. Spaces and dashes will be auto-formatted.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role / Job Title</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-[15px] appearance-none cursor-not-allowed"
                  value={role}
                  disabled
                >
                  <option value="" disabled hidden>No role assigned</option>
                  <option value="hr_senior">HR Personnel (Senior)</option>
                  <option value="hr_junior">HR Personnel (Junior)</option>
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
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={handleCurrentPasswordChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500 mt-1.5">{passwordError}</p>}
                {isPasswordVerified && <p className="text-xs text-emerald-500 mt-1.5">✓ Password verified</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    ref={newPasswordRef}
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={newPassword}
                    onFocus={handleNewPasswordFocus}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
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
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2.5 bg-[#1e293b] text-white rounded-lg hover:bg-slate-800 font-medium text-sm shadow-sm transition-colors disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
