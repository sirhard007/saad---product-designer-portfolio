import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Home from "./Home";
import ProjectView from "./ProjectView";
import Admin from "./Admin";
import Login from "./Login";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsVerified(false);
      return;
    }

    fetch("/api/verify", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setIsVerified(true);
        } else {
          localStorage.removeItem('adminToken');
          setIsVerified(false);
        }
      })
      .catch(() => setIsVerified(false));
  }, []);

  if (isVerified === null) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-white/40 uppercase tracking-widest text-sm">Verifying access...</div>;
  }

  if (!isVerified) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
