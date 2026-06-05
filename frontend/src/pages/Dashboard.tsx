import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HRDashboard from '../components/HRDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import { supabase } from '../config/supabaseClient';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Loading...');
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
        .select('name, role')
        .eq('email', user.email)
        .single();

      if (!dbError && staffData) {
        setUserName(staffData.name);
        setUserRole(staffData.role);
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
          <p className="text-slate-500 text-[14px] mt-2">Please wait while we confirm your access permissions.</p>
        </div>
      </div>
    );
  }

  if (userRole === 'hr_senior' || userRole === 'hr_junior') {
    return <HRDashboard userName={userName} />;
  }

  if (userRole === 'hiring_manager') {
    return <ManagerDashboard userName={userName} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-start justify-start p-10 font-sans">
      <div className="w-full max-w-xl bg-white rounded-xl border-red-200 bg-red-50 p-8 shadow-sm text-left text-red-700">
        <p className="font-medium">Access Denied</p>
        <p className="text-[14px] mt-2">Your account does not have an assigned dashboard role. Please contact an administrator.</p>
      </div>
    </div>
  );
}
