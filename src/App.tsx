import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
      <AnimatedRoutes />
    </Router>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="page-transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduceMotion ? 0 : 1 }}
        transition={{ duration: reduceMotion ? 0.16 : 0.2 }}
      >
        {!reduceMotion && (
          <motion.div
            className="route-curtain"
            initial={{ scaleX: 1, transformOrigin: "left center" }}
            animate={{ scaleX: 0, transformOrigin: "right center" }}
            exit={{ scaleX: 1, transformOrigin: "right center" }}
            transition={{ duration: 0.68, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden="true"
          />
        )}
        <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
