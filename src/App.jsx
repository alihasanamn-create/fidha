import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";

import "./App.css";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./AdminDashboard";
import AdminParentView from "./components/AdminParentView";
import ParentDashboard from "./components/ParentDashboard";

import { auth } from "./firebase";
import loginBackground from "./assets/login-bg.png";

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("admin");
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOpening(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setMode("admin");
  };

  // Opening screen
  if (showOpening) {
    return (
      <div
        className="opening-screen"
        style={{
          backgroundImage: `url("${loginBackground}")`,
        }}
      />
    );
  }

  // Login screen
  if (!user) {
    return <Login setUser={setUser} />;
  }

  // Parent dashboard
  if (user.role === "parent") {
    return (
      <ParentDashboard
        user={user}
        setUser={setUser}
      />
    );
  }

  // Admin dashboard
  return (
    <div className="app-layout">
      <Sidebar
        setMode={setMode}
        activeMode={mode}
        onLogout={handleLogout}
      />

      <main className="admin-content">
        {/* Main Dashboard */}
        {mode === "admin" && <AdminDashboard />}

        {/* Class Sections */}
        {mode === "s1" && (
          <AdminDashboard classFilter="S1" />
        )}

        {mode === "s2" && (
          <AdminDashboard classFilter="S2" />
        )}

        {mode === "s3" && (
          <AdminDashboard classFilter="S3" />
        )}

        {mode === "s4" && (
          <AdminDashboard classFilter="S4" />
        )}

        {/* Downloads */}
        {mode === "downloads" && (
          <AdminDashboard downloadMode />
        )}

        {/* Parent View */}
        {mode === "parent" && <AdminParentView />}
      </main>
    </div>
  );
}