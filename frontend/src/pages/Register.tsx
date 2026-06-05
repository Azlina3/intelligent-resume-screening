import { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import './Auth.css';

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  // Form 
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // 1. Create the user inside Supabase's secure Auth layer
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          department_id: parseInt(department, 10),
          role: role
        }
      }
    });

    if (authError) {
      setFeedback({ type: 'error', text: authError.message });
      setLoading(false);
      return;
    }

    // 2. If Auth succeeded, take their brand-new secure ID and insert them into your public staff table!
    if (authData?.user) {
      const { error: dbError } = await supabase
        .from('staff_user') // Maps directly to your public staff table
        .insert([
          {
            user_id: authData.user.id, // Links the secure auth ID directly to this row
            email: email,
            name: fullName,
            department_id: parseInt(department, 10),
            role: role,
            //password: password // Included to match schema, though securely managed by Supabase Auth
          }
        ]);

      if (dbError) {
        setFeedback({ type: 'error', text: `Auth created, but staff table failed: ${dbError.message}` });
      } else {
        setFeedback({ type: 'success', text: 'Successfully created. Check email to verify your account.' });
        setFullName('');
        setEmail('');
        setDepartment('');
        setRole('');
        setPassword('');
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Staff Account</h1>
        <p className="auth-subtitle">
          Set up system access and permissions for company personnel.
        </p>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`auth-feedback ${feedback.type === 'error' ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50'} p-3 rounded-md mb-4 text-sm font-sans left-align`}>
            {feedback.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Aida Ibrahim"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Department</label>
            <select
              className="form-input form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select department...</option>
              <option value="1">Human Resources</option>
              <option value="2">Technology & Engineering</option>
              <option value="3">Finance & Accounts</option>
              <option value="4">Marketing & Sales</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">System Access Role</label>
            <select
              className="form-input form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select role level...</option>
              <option value="hr_senior">HR Personnel (Senior)</option>
              <option value="hr_junior">HR Personnel (Junior)</option>
              <option value="hiring_manager">Hiring Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Records...' : 'Register Staff Member'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <a href="/login" className="auth-link">Sign in</a>
        </div>
      </div>
    </div>
  );
}