import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";

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

  // Opening screen for 3 seconds
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOpening(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setMode("admin");
  };


  /*
    OPENING SCREEN

    ONLY login-bg.png.
    Nothing else.
  */

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


  /*
    LOGIN PAGE

    After 3 seconds,
    your normal Login.jsx appears.
  */

  if (!user) {
    return (
      <Login
        setUser={setUser}
      />
    );
  }


  /*
    PARENT PORTAL
  */

  if (user.role === "parent") {
    return (
      <ParentDashboard
        user={user}
        setUser={setUser}
      />
    );
  }


  /*
    ADMIN PORTAL
  */

  return (
    <div className="app-layout">

      <Sidebar
        setMode={setMode}
        activeMode={mode}
        onLogout={handleLogout}
      />

      <main className="admin-content">

        {mode === "admin" && (
          <AdminDashboard />
        )}

        {mode === "s1" && (
          <AdminDashboard
            classFilter="S1"
          />
        )}

        {mode === "s2" && (
          <AdminDashboard
            classFilter="S2"
          />
        )}

        {mode === "downloads" && (
          <AdminDashboard
            downloadMode
          />
        )}

        {mode === "parent" && (
          <AdminParentView />
        )}

      </main>

    </div>
  );
}