import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobForm from './pages/JobForm';
import CreateJob from './pages/CreateJob';
import TrackStatus from './pages/TrackStatus';
import EmailTemplates from './pages/EmailTemplates';

import CreateTemplate from './pages/CreateTemplate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Explicit paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply/:jobId" element={<JobForm />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/edit-job/:jobId" element={<CreateJob />} />
        <Route path="/view-job/:jobId" element={<CreateJob />} />
        <Route path="/create-template" element={<CreateTemplate />} />
        <Route path="/edit-template/:templateId" element={<CreateTemplate />} />
        <Route path="/track-status" element={<TrackStatus />} />
        <Route path="/email-templates" element={<EmailTemplates />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
