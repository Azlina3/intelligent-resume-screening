import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobForm from './pages/JobForm';
import CreateJob from './pages/CreateJob';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Explicit paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply/:jobId" element={<JobForm />} />
        <Route path="/create-job" element={<CreateJob />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
