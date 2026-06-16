import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HRDashboard from '../components/HRDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { supabase } from '../config/supabaseClient';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Loading...');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/login');
        return;
      }

      const { data: staffData, error: dbError } = await supabase
        .from('staff_user')
        .select('name, role, department_id, job_department(department_name)')
        .eq('email', user.email)
        .single();

      if (!dbError && staffData) {
        setUserName(staffData.name);
        setUserRole(staffData.role);
        setDepartmentId(staffData.department_id);
        if (staffData.job_department && !Array.isArray(staffData.job_department)) {
           setDepartmentName((staffData.job_department as any).department_name);
        }
      } else {
        // Fallback to user_metadata if db fetch fails
        setUserName(user.user_metadata?.name || 'User');
        setUserRole(user.user_metadata?.role);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-start justify-start p-10 font-sans">
        <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
          <p className="text-slate-800 text-[16px] font-medium">Verifying workspace authorization...</p>
        </div>
      </div>
    );
  }

  if (userRole === 'hr_senior' || userRole === 'hr_junior') {
    return <HRDashboard userName={userName} userRole={userRole} />;
  } else if (userRole === 'hiring_manager') {
    return <ManagerDashboard userName={userName} departmentId={departmentId} departmentName={departmentName} />;
  } else if (userRole === 'system_admin') {
    return <AdminDashboard userName={userName} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-start justify-start p-10 font-sans">
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
        <h2 className="text-[22px] font-serif font-bold text-slate-800 tracking-tight">Access Restricted</h2>
        <p className="text-[14px] mt-2">Your account does not have an assigned dashboard role. Please contact an administrator.</p>
      </div>
    </div>
  );
}
