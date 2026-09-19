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

async function readResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export default function GetCandidates() {
  const [jobId, setJobId] = useState("");
  const [topLimit, setTopLimit] = useState(20);
  const [allCandidates, setAllCandidates] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [selectedShortlisted, setSelectedShortlisted] = useState(new Set());
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [updatingCandidateId, setUpdatingCandidateId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pipeline, setPipeline] = useState(null);

  const mergeShortlistState = (candidates, previousSelection) => {
    const next = new Set(previousSelection);
    candidates.forEach((cand, index) => {
      const candidateId = getCandidateId(cand, index);
      if (cand.isShortlisted) next.add(candidateId);
      else next.delete(candidateId);
    });
    return next;
  };

  const syncCandidatesState = (candidateId, isShortlisted) => {
    setAllCandidates((prev) => prev.map((cand, index) =>
      getCandidateId(cand, index) === candidateId ? { ...cand, isShortlisted } : cand
    ));
    setTopCandidates((prev) => prev.map((cand, index) =>
      getCandidateId(cand, index) === candidateId ? { ...cand, isShortlisted } : cand
    ));
    setSelectedShortlisted((prev) => {
      const next = new Set(prev);
      if (isShortlisted) next.add(candidateId);
      else next.delete(candidateId);
      return next;
    });
  };

  const fetchAll = async () => {
    const cleanJobId = jobId.trim();
    if (!cleanJobId) {
      setError("Please enter Job ID.");
      return;
    }
    setLoadingAll(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/resumes/candidates/${encodeURIComponent(cleanJobId)}`, {
        headers: { ...getAuthHeader() },
      });
      const data = await readResponse(res);
      const candidates = normalizeCandidates(data);
      setAllCandidates(candidates);
      setSelectedShortlisted((prev) => mergeShortlistState(candidates, prev));
      if (candidates.length === 0) setSuccess("No candidates found for this Job ID yet.");
    } catch (err) {
      console.error(err);
      setAllCandidates([]);
      setError(err.message || "Failed to fetch candidates.");
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchTop = async () => {
    const cleanJobId = jobId.trim();
    if (!cleanJobId) {
      setError("Please enter Job ID.");
      return;
    }
    setLoadingTop(true);
    setError("");
    setSuccess("");
    try {
      const params = new URLSearchParams({ jobId: cleanJobId, limit: String(topLimit || 5) });
      const res = await fetch(`${API_BASE}/resumes/top-candidates?${params}`, {
        headers: { ...getAuthHeader() },
      });
      const data = await readResponse(res);
      const candidates = normalizeCandidates(data);
      setTopCandidates(candidates);
      setPipeline(data?.pipeline || null);
      setSelectedShortlisted((prev) => mergeShortlistState(candidates, prev));
      if (candidates.length === 0) setSuccess("No candidates found for this Job ID yet.");
    } catch (err) {
      console.error(err);
      setTopCandidates([]);
      setError(err.message || "Failed to fetch top candidates.");
    } finally {
      setLoadingTop(false);
    }
  };

  const handleShortlistedChange = async (candidateId, isCurrentlyShortlisted) => {
    try {
      setUpdatingCandidateId(candidateId);
      setError("");
      const nextValue = !isCurrentlyShortlisted;
      const res = await fetch(`${API_BASE}/resumes/candidates/${encodeURIComponent(candidateId)}/selection`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          isShortlisted: nextValue,
          shortlistReason: nextValue ? "Selected from candidate list" : "",
        }),
      });
      await readResponse(res);
      syncCandidatesState(candidateId, nextValue);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update candidate selection.");
    } finally {
      setUpdatingCandidateId("");
    }
  };

  const sendRejectionEmails = async () => {
    if (allCandidates.length === 0) {
      setError("Please fetch all candidates first.");
      return;
    }

    const rejectedCandidates = allCandidates.filter((cand, index) => {
      const candId = getCandidateId(cand, index);
      return !selectedShortlisted.has(candId);
    });

    if (rejectedCandidates.length === 0) {
      setError("No candidates to send rejection emails to.");
      return;
    }

    const withoutEmail = rejectedCandidates.filter((cand) => !cand.email);
    if (withoutEmail.length > 0) {
      setError(`${withoutEmail.length} rejected candidate(s) have no email address and will be skipped.`);
    } else {
      setError("");
    }

    setSendingEmails(true);
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/resumes/send-rejection-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          jobId: jobId.trim(),
          rejectedCandidates: rejectedCandidates.map((cand) => ({
            email: cand.email,
            name: cand.name,
            resumeId: cand._id || cand.id,
          })),
        }),
      });
      const data = await readResponse(res);
      setSuccess(`${data.message || "Rejection emails sent successfully"}. Sent: ${data.rejectedCount ?? 0}, shortlisted: ${data.shortlistedCount ?? 0}.`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send rejection emails.");
    } finally {
      setSendingEmails(false);
    }
  };

  const renderCandidates = (candidates) => {
    if (candidates.length === 0) return <p className="empty-state">No candidates to display.</p>;

    return candidates.map((cand, index) => {
      const candId = getCandidateId(cand, index);
      const isShortlisted = selectedShortlisted.has(candId) || Boolean(cand.isShortlisted);
      const isUpdating = updatingCandidateId === candId;
      const missingSkills = Array.isArray(cand.missingSkills) ? cand.missingSkills : [];

      return (
        <div key={candId} className="candidate-card">
          <div className="candidate-card-header">
            <h4>{cand.name || "Unknown Candidate"}</h4>
            <label className={`selection-toggle ${isShortlisted ? "selected" : "not-selected"} ${isUpdating ? "disabled" : ""}`}>
              <input type="checkbox" checked={isShortlisted} disabled={isUpdating} onChange={() => handleShortlistedChange(candId, isShortlisted)} />
              <span>{isUpdating ? "Updating..." : isShortlisted ? "Selected" : "Not Selected"}</span>
            </label>
          </div>
          <p><strong>Email:</strong> {cand.email || "-"}</p>
          <p><strong>Phone:</strong> {cand.phone || "-"}</p>
          <p><strong>Final AI Score:</strong> {getScore(cand)} / 100</p>
          <p><strong>Keyword Score:</strong> {cand.keywordScore ?? "-"} / 100</p>
          <p><strong>Semantic Score:</strong> {cand.semanticScore ?? "-"} / 100</p>
          {Array.isArray(cand.strengths || cand.aiAnalysis?.strengths) && (cand.strengths || cand.aiAnalysis?.strengths).length > 0 && <p><strong>Strengths:</strong> {(cand.strengths || cand.aiAnalysis?.strengths).join(", ")}</p>}
          {cand.aiAnalysis?.reasoning && <p><strong>AI Reasoning:</strong> {cand.aiAnalysis.reasoning}</p>}
          <p><strong>Summary:</strong> {cand.summary || cand.extractedText || "-"}</p>
          {missingSkills.length > 0 && <p><strong>Missing / weaker skills:</strong> {missingSkills.join(", ")}</p>}
          {cand.rejectionReason && <p><strong>Rejection reason:</strong> {cand.rejectionReason}</p>}
          <p><strong>Resume File:</strong> {cand.resumeFile || cand.fileName || "-"}</p>
          <p><strong>Status:</strong> {isShortlisted ? "Shortlisted" : "Not shortlisted"}</p>
        </div>
      );
    });
  };

  return (
    <div className="page">
      <h2>Get Candidates</h2>
      <div className="inputs">
        <input placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
        <input type="number" placeholder="Final candidates (max 20)" value={topLimit} min={1} max={20} onChange={(e) => setTopLimit(Number(e.target.value) || 1)} />
      </div>
      <div className="buttons">
        <button onClick={fetchAll} disabled={loadingAll || loadingTop || sendingEmails}>
          {loadingAll ? "Loading..." : "Get All Candidates"}
        </button>
        <button onClick={fetchTop} disabled={loadingAll || loadingTop || sendingEmails}>
          {loadingTop ? "Loading..." : "Get Top Candidates"}
        </button>
        {allCandidates.length > 0 && (
          <button onClick={sendRejectionEmails} disabled={sendingEmails || loadingAll || loadingTop}>
            {sendingEmails ? "Sending..." : "Send Rejection Emails"}
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {pipeline && (
        <div className="pipeline-summary">
          <strong>Screening pipeline:</strong> {pipeline.totalCandidates} resumes → {pipeline.keywordStage} keyword candidates → {pipeline.semanticStage} semantic/RAG candidates → {pipeline.finalStage} Gemini-analyzed candidates
        </div>
      )}

      <h3>All Candidates ({allCandidates.length})</h3>
      <div className="candidates-container">{renderCandidates(allCandidates)}</div>

      <h3>Top Candidates ({topCandidates.length})</h3>
      <div className="candidates-container">{renderCandidates(topCandidates)}</div>
    </div>
  );
}
