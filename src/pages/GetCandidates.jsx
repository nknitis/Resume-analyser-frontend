import React, { useState } from "react";
import { getAuthHeader } from "../config/auth";
import { API_BASE } from "../config/api";

const normalizeCandidates = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.candidates)) return data.candidates;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const getScore = (candidate) =>
  candidate?.score ?? candidate?.matchScore ?? candidate?.atsScore ?? "-";

const getCandidateId = (candidate, index = 0) =>
  candidate?._id || candidate?.id || `${candidate?.email || "candidate"}-${index}`;

export default function GetCandidates() {
  const [jobId, setJobId] = useState("");
  const [topLimit, setTopLimit] = useState(5);
  const [allCandidates, setAllCandidates] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [selectedShortlisted, setSelectedShortlisted] = useState(new Set());
  const [sendingEmails, setSendingEmails] = useState(false);
  const [updatingCandidateId, setUpdatingCandidateId] = useState("");

  const mergeShortlistState = (candidates, previousSelection) => {
    const next = new Set(previousSelection);

    candidates.forEach((cand, index) => {
      const candidateId = getCandidateId(cand, index);
      if (cand.isShortlisted) {
        next.add(candidateId);
      } else {
        next.delete(candidateId);
      }
    });

    return next;
  };

  const syncCandidatesState = (candidateId, isShortlisted) => {
    setAllCandidates((prev) =>
      prev.map((cand, index) =>
        getCandidateId(cand, index) === candidateId
          ? { ...cand, isShortlisted }
          : cand
      )
    );

    setTopCandidates((prev) =>
      prev.map((cand, index) =>
        getCandidateId(cand, index) === candidateId
          ? { ...cand, isShortlisted }
          : cand
      )
    );

    setSelectedShortlisted((prev) => {
      const next = new Set(prev);
      if (isShortlisted) {
        next.add(candidateId);
      } else {
        next.delete(candidateId);
      }
      return next;
    });
  };

  const fetchAll = async () => {
    const cleanJobId = jobId.trim();

    if (!cleanJobId) return;

    try {
      const res = await fetch(
        `${API_BASE}/resumes/candidates/${encodeURIComponent(cleanJobId)}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        }
      );
      const data = await res.json();
      const candidates = normalizeCandidates(data);
      setAllCandidates(candidates);
      setSelectedShortlisted((prev) => mergeShortlistState(candidates, prev));
    } catch (err) {
      console.error(err);
      setAllCandidates([]);
    }
  };

  const fetchTop = async () => {
    const cleanJobId = jobId.trim();

    if (!cleanJobId) return;

    try {
      const params = new URLSearchParams({
        jobId: cleanJobId,
        limit: String(topLimit || 5),
      });

      const res = await fetch(`${API_BASE}/resumes/top-candidates?${params}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await res.json();
      const candidates = normalizeCandidates(data);
      setTopCandidates(candidates);
      setSelectedShortlisted((prev) => mergeShortlistState(candidates, prev));
    } catch (err) {
      console.error(err);
      setTopCandidates([]);
    }
  };

  const handleShortlistedChange = async (candidateId, isCurrentlyShortlisted) => {
    try {
      setUpdatingCandidateId(candidateId);
      const nextValue = !isCurrentlyShortlisted;

      const res = await fetch(
        `${API_BASE}/resumes/candidates/${encodeURIComponent(candidateId)}/selection`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            isShortlisted: nextValue,
            shortlistReason: nextValue ? "Selected from candidate list" : "",
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update candidate selection");
      }

      syncCandidatesState(candidateId, nextValue);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update candidate selection.");
    } finally {
      setUpdatingCandidateId("");
    }
  };

  const sendRejectionEmails = async () => {
    if (allCandidates.length === 0) {
      alert("Please fetch all candidates first.");
      return;
    }

    const rejectedCandidates = allCandidates.filter((cand, index) => {
      const candId = getCandidateId(cand, index);
      return !selectedShortlisted.has(candId);
    });

    if (rejectedCandidates.length === 0) {
      alert("No candidates to send rejection emails to.");
      return;
    }

    setSendingEmails(true);
    try {
      const res = await fetch(`${API_BASE}/resumes/send-rejection-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          jobId: jobId.trim(),
          rejectedCandidates: rejectedCandidates.map((cand) => ({
            email: cand.email,
            name: cand.name,
            resumeId: cand._id || cand.id,
          })),
        }),
      });

      if (res.ok) {
        alert("Rejection emails sent successfully!");
      } else {
        const error = await res.json();
        alert(`Error sending emails: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send rejection emails.");
    } finally {
      setSendingEmails(false);
    }
  };

  const renderCandidates = (candidates) =>
    candidates.map((cand, index) => {
      const candId = getCandidateId(cand, index);
      const isShortlisted = selectedShortlisted.has(candId) || Boolean(cand.isShortlisted);
      const isUpdating = updatingCandidateId === candId;

      return (
        <div key={candId} className="candidate-card">
          <div className="candidate-card-header">
            <h4>{cand.name || "-"}</h4>
            <label
              className={`selection-toggle ${isShortlisted ? "selected" : "not-selected"} ${isUpdating ? "disabled" : ""}`}
            >
              <input
                type="checkbox"
                checked={isShortlisted}
                disabled={isUpdating}
                onChange={() => handleShortlistedChange(candId, isShortlisted)}
              />
              <span>{isShortlisted ? "Selected" : "Not Selected"}</span>
            </label>
          </div>
          <p>
            <strong>Email:</strong> {cand.email || "-"}
          </p>
          <p>
            <strong>Phone:</strong> {cand.phone || "-"}
          </p>
          <p>
            <strong>Score:</strong> {getScore(cand)}
          </p>
          <p>
            <strong>Summary:</strong> {cand.summary || cand.extractedText || "-"}
          </p>
          <p>
            <strong>Resume File:</strong> {cand.resumeFile || cand.fileName || "-"}
          </p>
          <p>
            <strong>Status:</strong> {isUpdating ? "Updating..." : isShortlisted ? "Selected" : "Not Selected"}
          </p>
          <hr />
        </div>
      );
    });

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
          min={1}
          onChange={(e) => setTopLimit(Number(e.target.value) || 1)}
        />
      </div>
      <div className="buttons">
        <button onClick={fetchAll}>Get All Candidates</button>
        <button onClick={fetchTop}>Get Top Candidates</button>
        {topCandidates.length > 0 && (
          <button onClick={sendRejectionEmails} disabled={sendingEmails}>
            {sendingEmails ? "Sending..." : "Send Rejection Emails"}
          </button>
        )}
      </div>

      <h3>All Candidates:</h3>
      <div className="candidates-container">{renderCandidates(allCandidates)}</div>

      <h3>Top Candidates:</h3>
      <div className="candidates-container">{renderCandidates(topCandidates)}</div>
    </div>
  );
}
