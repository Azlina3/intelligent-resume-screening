import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import ProfileSettings from './ProfileSettings';

// Icon components
const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const OfficeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface StaffUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  department_id: number;
  job_department?: { department_name: string };
}

export default function AdminDashboard({ userName }: { userName?: string }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'settings' | 'departments'>('dashboard');
  
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'hr_junior', department_id: 1 });
  const [resetPassword, setResetPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editDeptName, setEditDeptName] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data as StaffUser[]);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from('job_department').select('*').order('department_id', { ascending: true });
    if (data) setDepartments(data);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveUser = async () => {
    if (!formData.email || !formData.name || !formData.role || !formData.department_id) return;
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const res = await fetch(`http://localhost:8000/api/admin/users/${editingUser.user_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            role: formData.role,
            department_id: Number(formData.department_id)
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Failed to update user');
        }
      } else {
        // Create user
        if (!formData.password) throw new Error("Password is required for new users");
        const res = await fetch(`http://localhost:8000/api/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: formData.role,
            department_id: Number(formData.department_id)
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Failed to create user');
        }
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser || !resetPassword) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${editingUser.user_id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: resetPassword })
      });
      if (!res.ok) throw new Error('Failed to reset password');
      alert('Password reset successfully');
      setShowResetModal(false);
      setResetPassword('');
    } catch (err: any) {
      alert(err.message);
    }
    setIsSubmitting(false);
  };

  const openEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({ email: user.email, name: user.name, password: '', role: user.role, department_id: user.department_id });
    setShowUserModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', name: '', password: '', role: 'hr_junior', department_id: departments[0]?.department_id || 1 });
    setShowUserModal(true);
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('job_department').insert([{ department_name: newDeptName.trim() }]);
      if (error) throw error;
      setNewDeptName('');
      fetchDepartments();
    } catch (err: any) {
      alert(err.message);
    }
    setIsSubmitting(false);
  };

  const handleUpdateDepartment = async (deptId: number) => {
    if (!editDeptName.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('job_department').update({ department_name: editDeptName.trim() }).eq('department_id', deptId);
      if (error) throw error;
      setEditingDeptId(null);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#1e293b] text-white flex flex-col flex-shrink-0">
        <div className="p-8 pb-4 text-left">
          <h2 className="text-[22px] font-serif font-bold tracking-wide">TalentScreen</h2>
          <p className="text-slate-400 text-xs mt-1">System Administration</p>
        </div>
        
        <nav className="flex-1 mt-6">
          <ul className="space-y-2">
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'dashboard' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60"><ShieldIcon /></span>
                <span className="text-[15px]">Admin Home</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('users'); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'users' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60"><UsersIcon /></span>
                <span className="text-[15px]">Manage Users</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('departments'); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'departments' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60"><OfficeIcon /></span>
                <span className="text-[15px]">Manage Departments</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="py-8 border-t border-slate-700/50">
          <ul className="space-y-4 text-left">
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }}
                className={`flex items-center px-8 py-2.5 transition-colors ${currentView === 'settings' ? 'text-white font-medium bg-white/5' : 'text-slate-300 hover:text-white'}`}
              >
                <span className="mr-3 opacity-60">⚙️</span>
                <span className="text-[15px]">Profile Settings</span>
              </a>
            </li>
            <li>
              <button onClick={handleLogout} className="flex items-center w-full px-8 text-slate-300 hover:text-white text-[15px] text-left">
                <span className="mr-3 opacity-60">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      {(() => {
        if (currentView === 'dashboard') {
          return (
            <main className="flex-1 p-10 px-12 overflow-y-auto">
              <header className="mb-10 text-left">
                <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">System Administration</h1>
                <p className="text-slate-500 text-[15px]">Welcome, {userName || 'Admin'}. Manage system settings and user access.</p>
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setCurrentView('users')}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-slate-500 text-sm font-medium">Total System Users</span>
                    <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                      <UsersIcon />
                    </div>
                  </div>
                  <div className="text-[38px] font-serif text-[#1a56db] mb-5 leading-none">{users.length}</div>
                  <div className="mt-auto pt-4 border-t border-slate-50/0">
                    <span className="text-[#1a56db] text-sm font-medium hover:underline flex items-center">
                      Manage users <span className="ml-1 text-lg leading-none">→</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm flex flex-col text-left hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => setCurrentView('departments')}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-slate-500 text-sm font-medium">Job Departments</span>
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 text-emerald-600">
                      <OfficeIcon />
                    </div>
                  </div>
                  <div className="text-[38px] font-serif text-[#059669] mb-5 leading-none">{departments.length}</div>
                  <div className="mt-auto pt-4 border-t border-slate-50/0">
                    <span className="text-[#059669] text-sm font-medium hover:underline flex items-center">
                      Manage departments <span className="ml-1 text-lg leading-none">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </main>
          );
        } else if (currentView === 'users') {
          return (
            <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
              <div className="max-w-6xl mx-auto text-left">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Manage Users</h1>
                    <p className="text-slate-500 text-[15px]">Create, update, and delete staff accounts and manage roles.</p>
                  </div>
                  <button 
                    onClick={openCreateModal}
                    className="bg-[#1a56db] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
                  >
                    <span className="mr-2">+</span> Add New User
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[13px] uppercase tracking-wider font-semibold">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Department</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td></tr>
                      ) : users.map(user => (
                        <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-medium text-slate-800">{user.name}</td>
                          <td className="p-4 text-slate-600">{user.email}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">
                            {user.job_department?.department_name || 'N/A'}
                          </td>
                          <td className="p-4 pr-6 flex justify-end gap-2">
                            <button onClick={() => openEditModal(user)} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">Edit</button>
                            <button onClick={() => { setEditingUser(user); setShowResetModal(true); }} className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors">Reset Pwd</button>
                            <button onClick={() => handleDeleteUser(user.user_id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Modal */}
              {showUserModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xl font-serif font-bold text-[#0f172a]">{editingUser ? 'Edit User' : 'Create New User'}</h3>
                      <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                          <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          <option value="hr_junior">HR Junior</option>
                          <option value="hr_senior">HR Senior</option>
                          <option value="hiring_manager">Hiring Manager</option>
                          <option value="system_admin">System Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select value={formData.department_id} onChange={e => setFormData({...formData, department_id: Number(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          {departments.map(d => (
                            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                      <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                      <button onClick={handleSaveUser} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{isSubmitting ? 'Saving...' : 'Save User'}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Password Modal */}
              {showResetModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xl font-serif font-bold text-[#0f172a]">Reset Password</h3>
                      <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-slate-600">Enter a new temporary password for <strong>{editingUser?.name}</strong>.</p>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input type="text" value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                      <button onClick={() => setShowResetModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                      <button onClick={handleResetPassword} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">{isSubmitting ? 'Resetting...' : 'Reset Password'}</button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          );
        } else if (currentView === 'departments') {
          return (
            <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
              <div className="max-w-4xl mx-auto text-left">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Job Departments</h1>
                    <p className="text-slate-500 text-[15px]">View and add new departments for your organization.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8 text-left">
                  <h2 className="text-lg font-serif font-bold text-[#0f172a] mb-4">Add New Department</h2>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Department Name</label>
                      <input 
                        type="text" 
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder="e.g. Sales & Strategy"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-[15px]"
                      />
                    </div>
                    <button 
                      onClick={handleAddDepartment}
                      disabled={isSubmitting || !newDeptName.trim()}
                      className="bg-[#1a56db] hover:bg-[#1e40af] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 h-[46px]"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Department'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[13px] uppercase tracking-wider font-semibold">
                        <th className="p-4 pl-8 w-24">ID</th>
                        <th className="p-4">Department Name</th>
                        <th className="p-4 pr-8 w-24 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departments.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-500">No departments found.</td></tr>
                      ) : departments.map(dept => (
                        <tr key={dept.department_id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-4 pl-8 font-medium text-slate-500">#{dept.department_id}</td>
                          <td className="p-4 font-medium text-slate-800">
                            {editingDeptId === dept.department_id ? (
                              <input 
                                type="text"
                                value={editDeptName}
                                onChange={(e) => setEditDeptName(e.target.value)}
                                className="w-full max-w-sm px-3 py-1.5 bg-white border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateDepartment(dept.department_id);
                                  if (e.key === 'Escape') setEditingDeptId(null);
                                }}
                              />
                            ) : (
                              dept.department_name
                            )}
                          </td>
                          <td className="p-4 pr-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingDeptId === dept.department_id ? (
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleUpdateDepartment(dept.department_id)} disabled={isSubmitting} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"><CheckIcon /></button>
                                <button onClick={() => setEditingDeptId(null)} disabled={isSubmitting} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors"><XIcon /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingDeptId(dept.department_id); setEditDeptName(dept.department_name); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                <PenIcon />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          );
        } else if (currentView === 'settings') {
          return <ProfileSettings userName={userName} />;
        }
      })()}
    </div>
  );
}
