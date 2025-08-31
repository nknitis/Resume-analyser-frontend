// import React, { useState } from 'react';
// const API_BASE = 'http://localhost:5000/api';

// export default function GetCandidates() {
//   const [jobId, setJobId] = useState('');
//   const [topLimit, setTopLimit] = useState(5);
//   const [allCandidates, setAllCandidates] = useState([]);
//   const [topCandidates, setTopCandidates] = useState([]);

//   const fetchAll = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/resumes/candidates/${jobId}`);
//       const data = await res.json();
//       setAllCandidates(data);
//     } catch (err) { console.error(err); }
//   };

//   const fetchTop = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/resumes/top-candidates?jobId=${jobId}&limit=${topLimit}`);
//       const data = await res.json();
//       setTopCandidates(data);
//     } catch (err) { console.error(err); }
//   };

//   return (
//     <div className="page">
//       <h2>Get Candidates</h2>
//       <input placeholder="Job ID" value={jobId} onChange={e => setJobId(e.target.value)} />
//       <input type="number" value={topLimit} onChange={e => setTopLimit(e.target.value)} />
//       <button onClick={fetchAll}>Get All Candidates</button>
//       <button onClick={fetchTop}>Get Top Candidates</button>
//       <h3>All Candidates:</h3>
//       <pre>{JSON.stringify(allCandidates, null, 2)}</pre>
//       <h3>Top Candidates:</h3>
//       <pre>{JSON.stringify(topCandidates, null, 2)}</pre>
//     </div>
//   );
// }


import React, { useState } from "react";

const API_BASE = "https://resume-analyser-backend-2gcm.onrender.com/api";

export default function GetCandidates() {
  const [jobId, setJobId] = useState("");
  const [topLimit, setTopLimit] = useState(5);
  const [allCandidates, setAllCandidates] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/resumes/candidates/${jobId}`);
      const data = await res.json();
      setAllCandidates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTop = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/resumes/top-candidates?jobId=${jobId}&limit=${topLimit}`
      );
      const data = await res.json();
      setTopCandidates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderCandidates = (candidates) =>
    candidates.map((cand) => (
      <div key={cand._id} className="candidate-card">
        <h4>{cand.name || "—"}</h4>
        <p><strong>Email:</strong> {cand.email || "—"}</p>
        <p><strong>Phone:</strong> {cand.phone || "—"}</p>
        <p><strong>Score:</strong> {cand.score}</p>
        <p><strong>Summary:</strong> {cand.summary || "—"}</p>
        <p><strong>Resume File:</strong> {cand.resumeFile || "—"}</p>
        <hr />
      </div>
    ));

  return (
    <div className="page">
      <h2>Get Candidates</h2>
      <div className="inputs">
        <input
          placeholder="Job ID"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Top X"
          value={topLimit}
          onChange={(e) => setTopLimit(e.target.value)}
        />
      </div>
      <div className="buttons">
        <button onClick={fetchAll}>Get All Candidates</button>
        <button onClick={fetchTop}>Get Top Candidates</button>
      </div>

      <h3>All Candidates:</h3>
      <div className="candidates-container">{renderCandidates(allCandidates)}</div>

      <h3>Top Candidates:</h3>
      <div className="candidates-container">{renderCandidates(topCandidates)}</div>
    </div>
  );
}
