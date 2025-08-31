import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AddJob from './pages/AddJob';
import UploadResume from './pages/UploadResume';
import GetCandidates from './pages/GetCandidates';

export default function App() {
  return (
    <div className="app">
      <nav>
        <Link to="/add-job"><button>Add Job</button></Link>
        <Link to="/upload-resume"><button>Upload Resume</button></Link>
        <Link to="/get-candidates"><button>Get Candidates</button></Link>
      </nav>

      <Routes>
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/get-candidates" element={<GetCandidates />} />
        <Route path="*" element={<AddJob />} /> {/* Default */}
      </Routes>
    </div>
  );
}
