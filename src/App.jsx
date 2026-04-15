import { useState, useEffect } from "react";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./AdminDashboard";
import AdminParentView from "./components/AdminParentView";
import ParentDashboard from "./components/ParentDashboard";
import Splash from "./Splash";

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Splash />;
  if (!user) return <Login setUser={setUser} />;

  // 👨‍👩‍👦 Parent
  if (user.role === "parent") {
    return <ParentDashboard user={user} setUser={setUser} />;
  }

  // 👨‍💼 Admin
  return (
    <div>
      <Sidebar setMode={setMode} />

      <div style={{ marginLeft: "240px", padding: "20px" }}>
        {mode === "admin" && <AdminDashboard />}
        {mode === "parent" && <AdminParentView />}
      </div>
    </div>
  );
}