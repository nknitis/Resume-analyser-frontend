import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to AI Resume Shortlister</h1>
          <p>Streamline your hiring process with our AI-powered resume analysis tool. Quickly shortlist candidates based on job requirements.</p>
          <div className="hero-image">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="workflow">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>1. Register / Login</h3>
            <p>Create an account or sign in to access the platform.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3V7M8 3V7M2 11H22" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>2. Add Job</h3>
            <p>Enter job details and requirements to define the criteria.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12M9 15H15" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>3. Upload Resume</h3>
            <p>Upload candidate resumes for analysis.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>4. Shortlist</h3>
            <p>Click to shortlist candidates that match the job requirements.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19V13C9 11.8954 9.89543 11 11 11H18C19.1046 11 20 11.8954 20 13V19C20 20.1046 19.1046 21 18 21H11C9.89543 21 9 20.1046 9 19Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V3M14 5H10" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>5. Get Summary</h3>
            <p>Receive a summarized response for shortlisted candidates.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19V13C9 11.8954 9.89543 11 11 11H18C19.1046 11 20 11.8954 20 13V19C20 20.1046 19.1046 21 18 21H11C9.89543 21 9 20.1046 9 19Z" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V3M14 5H10" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>5. Mail To </h3>
            <p>Customise Mail to Not Shortlisted Student so they can Improvee themselve.</p>
          </div>
        </div>
      </div>
      <div className="cta">
        <Link to="/register" className="btn-primary">Get Started</Link>
        <Link to="/login" className="btn-secondary">Login</Link>
      </div>
    </div>
  );
}