import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function TrackStatus() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);
    
    if (!email || !reference) {
      setErrorMsg('Please provide both your email and application reference.');
      return;
    }

    setIsLoading(true);
    try {
      // Call a secure database function to bypass RLS and verify credentials
      const { data, error } = await supabase
        .rpc('track_application_status', { 
          p_email: email, 
          p_reference: reference 
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        setErrorMsg('No application found with that email and reference number.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while fetching your status.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('reject') || s.includes('unsuccessful')) return -1;
    if (s.includes('pending') || s.includes('received')) return 0;
    if (s.includes('shortlist') || s.includes('review')) return 1;
    if (s.includes('interview') || s.includes('hold')) return 2;
    if (s.includes('offer') || s.includes('hire')) return 3;
    return 0; // Default
  };

  const stages = [
    { label: "Application Received", description: "We've safely received your application." },
    { label: "Under Review", description: "Our hiring team is reviewing your profile." },
    { label: "Interviewing", description: "You have been invited to an interview session, please check your email for details." },
    { label: "Decision", description: "Final hiring decision made." }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#1d4ed8] selection:text-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1d4ed8] rounded-xl flex items-center justify-center shadow-lg shadow-[#1d4ed8]/20">
              <span className="text-white font-serif font-bold text-xl leading-none">A</span>
            </div>
            <span className="font-serif font-bold text-xl text-[#0f172a] tracking-tight">
              Aura <span className="text-[#1d4ed8]">Careers</span>
            </span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-slate-600 hover:text-[#1d4ed8] transition-colors"
          >
            Staff Login
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0f172a] mb-4 tracking-tight">
          Track Your Application
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Enter your email address and application reference code to view the real-time status of your job application.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {/* Form Box */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 mb-8">
            <form onSubmit={handleTrack} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., john@example.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Application Reference Number</label>
                <input 
                  type="text" 
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., APP-123456" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors uppercase" 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-4 rounded-xl font-medium text-base transition-colors shadow-md shadow-[#1d4ed8]/20 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Check Status"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setResult(null)}
              className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-[#1d4ed8] transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Check another application
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#1d4ed8]"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#0f172a] mb-2">{result.job?.job_title || 'Unknown Position'}</h2>
                  <p className="text-slate-500 text-sm">
                    Applicant: <span className="font-medium text-slate-800">{result.candidate?.name}</span>
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Reference: <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{result.application_reference}</span>
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-[#1d4ed8] font-medium text-sm border border-blue-100 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#1d4ed8] mr-2"></span>
                    {result.application_status === 'On Hold' ? 'Interviewing' : result.application_status}
                  </div>
                  <p className="text-xs text-slate-400">
                    Applied on: {new Date(result.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="relative pt-4">
                {getStatusIndex(result.application_status) === -1 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#0f172a] mb-2">Application Unsuccessful</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Unfortunately, we won't be moving forward with your application at this time. We will keep your resume on file for future opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {stages.map((stage, index) => {
                      const currentIndex = getStatusIndex(result.application_status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={index} className="flex relative">
                          {/* Vertical Line Connector */}
                          {index !== stages.length - 1 && (
                            <div className={`absolute top-10 left-5 bottom-[-2rem] w-0.5 ${index < currentIndex ? 'bg-[#1d4ed8]' : 'bg-slate-200'}`}></div>
                          )}
                          
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-6 shadow-sm border-2 ${
                            isCompleted 
                              ? 'bg-[#1d4ed8] border-[#1d4ed8] text-white' 
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                              <span className="font-medium text-sm">{index + 1}</span>
                            )}
                            
                            {/* Pulse effect for current stage */}
                            {isCurrent && (
                              <div className="absolute inset-0 rounded-full border-2 border-[#1d4ed8] animate-ping opacity-20"></div>
                            )}
                          </div>
                          
                          <div className="pt-2 pb-4">
                            <h4 className={`text-base font-bold mb-1 ${isCompleted ? 'text-[#0f172a]' : 'text-slate-400'}`}>
                              {stage.label}
                            </h4>
                            <p className={`text-sm ${isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                              {stage.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
