import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/registration";
import Dashboard from "./pages/dashboard";
import { isAuthenticated } from "./auth";

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // Listen to auth changes via localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(isAuthenticated());
    };

    // When localStorage changes (e.g., login/logout), update auth state
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuth ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={isAuth ? <Navigate to="/dashboard" /> : <Login setIsAuth={setIsAuth} />} />
        <Route path="/register" element={isAuth ? <Navigate to="/dashboard" /> : <Register setIsAuth={setIsAuth} />} />
        <Route path="/dashboard" element={isAuth ? <Dashboard setIsAuth={setIsAuth} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
