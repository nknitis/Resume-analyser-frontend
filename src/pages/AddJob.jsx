import React, { useState } from "react";

const API_BASE = "https://resume-analyser-backend-2gcm.onrender.com/api";

export default function AddJob() {
  const [jobId, setJobId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleAddJob = async () => {
    if (!jobId || !description) {
      setMessage("Please fill both Job ID and Description");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/jobs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, description }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Job added successfully!");
        setJobId("");
        setDescription("");
      } else {
        setMessage(`Error: ${data.message || "Failed to add job"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to add job due to network error");
    }
  };

  return (
    <div className="page">
      <h2>Add Job</h2>
      <input
        type="text"
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />
      <textarea
        placeholder="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleAddJob}>Add Job</button>
      {message && <p>{message}</p>}
    </div>
  );
}
