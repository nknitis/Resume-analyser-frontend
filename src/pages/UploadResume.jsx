import React, { useState } from 'react';
const API_BASE = 'https://resume-analyser-backend-2gcm.onrender.com/api';

export default function UploadResume() {
  const [jobId, setJobId] = useState('');
  const [files, setFiles] = useState([]);
  const [log, setLog] = useState('');

  const handleUpload = async () => {
    if (!jobId || files.length === 0) return;
    const formData = new FormData();
    formData.append('jobId', jobId);
    for (let file of files) formData.append('resumes', file);

    try {
      const res = await fetch(`${API_BASE}/resumes/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setLog('Upload failed');
    }
  };

  return (
    <div className="page">
      <h2>Upload Resume</h2>
      <input placeholder="Job ID" value={jobId} onChange={e => setJobId(e.target.value)} />
      <input type="file" multiple onChange={e => setFiles(e.target.files)} />
      <button onClick={handleUpload}>Upload</button>
      <pre>{log}</pre>
    </div>
  );
}
