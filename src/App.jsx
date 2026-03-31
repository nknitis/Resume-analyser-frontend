import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import AddJob from "./pages/AddJob";
import UploadResume from "./pages/UploadResume";
import GetCandidates from "./pages/GetCandidates";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { clearAuthSession, getAuthToken, getAuthUser } from "./config/auth";

function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(getAuthUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const isAuthed = useMemo(() => Boolean(getAuthToken()), [user]);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setProfileOpen(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Resume Analyzer</h1>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            {isAuthed ? (
              <>
                <Link to="/add-job" className="nav-link">Add Job</Link>
                <Link to="/upload-resume" className="nav-link">Upload Resume</Link>
                <Link to="/get-candidates" className="nav-link">Get Candidates</Link>
                <div className="profile-dropdown" onMouseLeave={() => setProfileOpen(false)}>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="nav-link profile-button"
                  >
                    Profile ▼
                  </button>
                  {profileOpen && (
                    <div className="profile-menu">
                      <Link to="/profile" className="profile-menu-item" onClick={() => setProfileOpen(false)}>
                        My Details
                      </Link>
                      <Link to="/profile" className="profile-menu-item" onClick={() => setProfileOpen(false)}>
                        My Jobs
                      </Link>
                    </div>
                  )}
                </div>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isAuthed ? <Navigate to="/add-job" replace /> : <Login onAuthSuccess={setUser} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthed ? (
              <Navigate to="/add-job" replace />
            ) : (
              <Register onAuthSuccess={setUser} />
            )
          }
        />

        <Route
          path="/add-job"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <AddJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <UploadResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/get-candidates"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <GetCandidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
      <footer className="footer">
        <p>&copy; 2024 Resume Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
}
