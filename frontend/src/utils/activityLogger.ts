import { supabase } from '../supabaseClient';

export async function logActivity(
  actionHeadline: string,
  actionDetail: string,
  actionType: 'success' | 'info' | 'warning' | 'error' = 'info'
) {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.warn("No user found, cannot log activity.");
      return;
    }

    const userId = userData.user.id;

    // Fetch the staff_user record to get department_id
    const { data: staffData } = await supabase
      .from('staff_user')
      .select('department_id')
      .eq('user_id', userId)
      .single();

    const departmentId = staffData?.department_id || 1;

    const { error } = await supabase
      .from('activity_log')
      .insert([
        {
          staff_id: userId,
          department_id: departmentId,
          action_headline: actionHeadline,
          action_detail: actionDetail,
          action_type: actionType,
        }
      ]);
      
    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    console.error("Exception logging activity:", err);
  }
}
