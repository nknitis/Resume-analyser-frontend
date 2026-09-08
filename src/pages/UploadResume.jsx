import React, { useState } from "react";
import { getAuthHeader } from "../config/auth";
import { API_BASE } from "../config/api";

export default function UploadResume() {
  const [jobId, setJobId] = useState("");
  const [files, setFiles] = useState([]);
  const [log, setLog] = useState("");
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    setLog(`Uploading and analyzing ${files.length} resume${files.length > 1 ? "s" : ""}...`);

    try {
      const res = await fetch(`${API_BASE}/resumes/upload`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLog(data.message || "Upload failed");
        return;
      }

      const results = Array.isArray(data.results) ? data.results : [];
      const successful = results.filter((item) => item.status === "success");
      const failed = results.filter((item) => item.status === "failed");

      if (failed.length === 0) {
        setLog(`Successfully analyzed ${successful.length} resume${successful.length > 1 ? "s" : ""}. You can now open Get Candidates.`);
      } else {
        const failureText = failed
          .map((item) => `${item.filename}: ${item.reason || "Analysis failed"}`)
          .join("\n");
        setLog(`Processed: ${successful.length} successful, ${failed.length} failed.\n\n${failureText}`);
      }
    } catch (err) {
      console.error(err);
      setLog("Upload failed due to network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <h2>Upload Resume</h2>
      <input
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
        disabled={uploading}
      />
      <input
        type="file"
        multiple
        accept="application/pdf,.pdf"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        disabled={uploading}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading & Analyzing..." : "Upload"}
      </button>
      <pre>{log}</pre>
    </div>
  );
}
