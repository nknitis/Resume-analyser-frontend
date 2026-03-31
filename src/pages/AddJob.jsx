import React, { useState } from "react";
import { getAuthHeader } from "../config/auth";
import { API_BASE } from "../config/api";

export default function AddJob() {
  const [jobId, setJobId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleAddJob = async () => {
    const cleanJobId = jobId.trim();
    const cleanDescription = description.trim();

    if (!cleanJobId || !cleanDescription) {
      setMessage("Please fill both Job ID and Description");
      return;
    }

    try {
      const payload = {
        jobId: cleanJobId,
        description: cleanDescription,
        jobDescription: cleanDescription,
      };

      const res = await fetch(`${API_BASE}/jobs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.message || "Failed to add job"}`);
        return;
      }

      setMessage(data.message || "Job added successfully!");
      setJobId("");
      setDescription("");
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
