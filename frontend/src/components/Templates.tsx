import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface TemplatesProps {
  userRole: string | null;
}

export default function Templates({ userRole }: TemplatesProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_template')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setTemplates(data);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      // Delete requirements first due to FK constraint
      await supabase.from('job_template_requirement').delete().eq('template_id', templateId);
      const { error } = await supabase.from('job_template').delete().eq('template_id', templateId);
      if (error) throw error;
      setTemplates(templates.filter(t => t.template_id !== templateId));
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Failed to delete template.");
    }
  };

  return (
    <main className="flex-1 p-10 px-12 overflow-y-auto bg-[#fafafa]">
      <header className="mb-10 text-left">
        <h1 className="text-[34px] font-serif font-bold text-[#0f172a] mb-2 tracking-tight">Job Templates</h1>
        <p className="text-slate-500 text-[15px]">{userRole === 'hr_senior' ? 'Manage standard job templates' : 'View available job templates'}</p>
      </header>
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Available Templates</h2>
          {userRole === 'hr_senior' && (
            <button 
              onClick={() => navigate('/create-template')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Create New Template
            </button>
          )}
        </div>
        
        {loading ? (
          <p className="text-slate-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-slate-500">No templates found. {userRole === 'hr_senior' ? 'Create one to get started!' : ''}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.template_id} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-colors bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg mb-4">{template.template_name}</h3>
                
                <div className="text-sm text-slate-700 mb-4 space-y-1">
                  <div className="flex items-center gap-2"><span className="text-slate-400">💼</span> {template.job_title}</div>
                  {template.location && <div className="flex items-center gap-2"><span className="text-slate-400">📍</span> {template.location}</div>}
                </div>
                
                {userRole === 'hr_senior' && (
                  <div className="flex gap-2 pt-4 border-t border-slate-200 mt-4">
                    <button 
                      onClick={() => navigate(`/edit-template/${template.template_id}`)}
                      className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(template.template_id)}
                      className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
