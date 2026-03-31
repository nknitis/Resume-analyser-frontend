import React, { useState } from "react";
import { getAuthHeader } from "../config/auth";
import { API_BASE } from "../config/api";

export default function UploadResume() {
  const [jobId, setJobId] = useState("");
  const [files, setFiles] = useState([]);
  const [log, setLog] = useState("");

  const handleUpload = async () => {
    const cleanJobId = jobId.trim();

    if (!cleanJobId || files.length === 0) {
      setLog("Please enter Job ID and choose at least one resume file.");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", cleanJobId);

    for (const file of files) {
      formData.append("resumes", file);
    }

    try {
      const res = await fetch(`${API_BASE}/resumes/upload`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setLog(data.message || "Upload failed");
        return;
      }

      setLog(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setLog("Upload failed due to network error");
    }
  };

  return (
    <div className="page">
      <h2>Upload Resume</h2>
      <input
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button onClick={handleUpload}>Upload</button>
      <pre>{log}</pre>
    </div>
  );
}
