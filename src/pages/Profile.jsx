import React, { useEffect, useState } from "react";
import { getAuthUser, getAuthToken } from "../config/auth";
import { API_BASE } from "../config/api";

export default function Profile() {
  const [user] = useState(getAuthUser());
  const [activeTab, setActiveTab] = useState("details");
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [shortlisted, setShortlisted] = useState([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [shortlistError, setShortlistError] = useState(null);

  useEffect(() => {
    if (!user || !getAuthToken()) {
      return;
    }

    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = user.id || user.userId || user._id;
        let url = `${API_BASE}/jobs/user/${encodeURIComponent(userId)}`;
        // fallback endpoint in case API is different
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const data = await res.json();
        setJobs(Array.isArray(data) ? data : data.jobs || data.data || []);
      } catch (e) {
        console.error(e);
        setError("Unable to load your jobs. Please check backend API or network.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  useEffect(() => {
    const fetchShortlisted = async () => {
      if (!selectedJobId || !user || !getAuthToken()) return;
      setShortlistLoading(true);
      setShortlistError(null);
      try {
        // Primary path to get shortlisted candidates
        let res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(selectedJobId)}/shortlisted`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });

        if (!res.ok) {
          // fallback path if endpoint uses /resumes
          res = await fetch(`${API_BASE}/resumes/shortlisted/${encodeURIComponent(selectedJobId)}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
        }

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const data = await res.json();
        setShortlisted(Array.isArray(data) ? data : data.candidates || data.data || []);
      } catch (e) {
        console.error(e);
        setShortlistError("Unable to load shortlisted candidates for this job.");
        setShortlisted([]);
      } finally {
        setShortlistLoading(false);
      }
    };

    if (activeTab === "shortlist") {
      fetchShortlisted();
    }
  }, [activeTab, selectedJobId, user]);

  if (!user) {
    return (
      <div className="page">
        <h2>Profile</h2>
        <p>Please login to view profile details.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>My Profile</h2>

      <div className="profile-tabs">
        <button
          className={activeTab === "details" ? "tab active" : "tab"}
          onClick={() => setActiveTab("details")}
        >Profile Details</button>
        <button
          className={activeTab === "jobs" ? "tab active" : "tab"}
          onClick={() => setActiveTab("jobs")}
        >Added Jobs</button>
        <button
          className={activeTab === "shortlist" ? "tab active" : "tab"}
          onClick={() => setActiveTab("shortlist")}
        >Shortlisted Candidates</button>
      </div>

      {activeTab === "details" && (
        <div className="profile-section">
          <p><strong>Name:</strong> {user.name || user.fullName || "-"}</p>
          <p><strong>Email:</strong> {user.email || "-"}</p>
          <p><strong>User ID:</strong> {user.id || user.userId || user._id || "-"}</p>
          <p><strong>Password:</strong> •••••••• (hidden for security)</p>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="profile-section">
          <h3>My Added Jobs</h3>
          {loading ? (
            <p>Loading jobs ...</p>
          ) : error ? (
            <p className="message error">{error}</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found yet. Add a job to start shortlisting candidates.</p>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div key={job.id || job.jobId || job._id} className="job-card">
                  <h4>{job.jobId || job.id || "Job"}</h4>
                  <p><strong>Description:</strong> {job.description || job.jobDescription || "-"}</p>
                  <p><strong>Shortlisted:</strong> {job.shortlistedCount ?? job.shortlisted ?? job.shortlistedCandidates?.length ?? 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "shortlist" && (
        <div className="profile-section">
          <h3>Shortlisted Candidates by Job</h3>
          <p>Select a job to view its shortlisted candidate list.</p>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="job-select"
          >
            <option value="">Select job</option>
            {jobs.map((job) => {
              const jobIdValue = job.jobId || job.id || job._id;
              return (
                <option key={jobIdValue} value={jobIdValue}>
                  {job.jobId || job.id || job._id} ({job.shortlistedCount ?? job.shortlisted ?? 0} shortlisted)
                </option>
              );
            })}
          </select>

          {shortlistLoading ? (
            <p>Loading shortlisted candidates...</p>
          ) : shortlistError ? (
            <p className="message error">{shortlistError}</p>
          ) : selectedJobId ? (
            shortlisted.length === 0 ? (
              <p>No shortlisted candidates found yet for this job.</p>
            ) : (
              <div className="candidate-list">
                {shortlisted.map((cand) => {
                  const candKey = cand._id || cand.id || cand.email || JSON.stringify(cand);
                  return (
                    <div key={candKey} className="candidate-card">
                      <h4>{cand.name || cand.fullName || "Candidate"}</h4>
                      <p><strong>Email:</strong> {cand.email || "-"}</p>
                      <p><strong>Score:</strong> {cand.score ?? cand.matchScore ?? cand.atsScore ?? "-"}</p>
                      <p><strong>Shortlist Note:</strong> {cand.note || cand.shortlistReason || "No note"}</p>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
