import { useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Login({ setUser }) {
  const [mode, setMode] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Please enter your login details");
      return;
    }

    setLoading(true);

    try {
      // 👨‍👩‍👦 PARENT LOGIN
      if (mode === "parent") {
        const q = query(
          collection(db, "students"),
          where("adNo", "==", username.trim())
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          alert("User not found");
          return;
        }

        const docData = snap.docs[0];
        const data = docData.data();

        if (data.password !== password) {
          alert("Wrong password");
          return;
        }

        setUser({
          role: "parent",
          id: docData.id,
          student: data,
        });

        return;
      }

      // 👨‍💼 ADMIN LOGIN
      if (mode === "admin") {
        if (
          username.trim() === "admin" &&
          password === "admin123"
        ) {
          setUser({ role: "admin" });
        } else {
          alert("Invalid admin login");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* LOGO */}
        <div className="login-logo">
          F
        </div>

        <h1 className="login-title">
          Fidha Accounts
        </h1>

        <p className="login-subtitle">
          {mode === "admin"
            ? "Administration Portal"
            : "Parent Portal"}
        </p>

        {/* MODE SWITCH */}
        <div className="login-tabs">
          <button
            type="button"
            onClick={() => switchMode("admin")}
            className={`login-tab ${
              mode === "admin" ? "active" : ""
            }`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => switchMode("parent")}
            className={`login-tab ${
              mode === "parent" ? "active" : ""
            }`}
          >
            Parent
          </button>
        </div>

        {/* USERNAME */}
        <input
          className="login-input"
          value={username}
          placeholder={
            mode === "parent"
              ? "Admission No"
              : "Username"
          }
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />

        {/* PASSWORD */}
        <input
          className="login-input"
          value={password}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />

        {/* LOGIN */}
        <motion.button
          type="button"
          className="login-button"
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </motion.button>

        <p className="login-footer">
          SMAC • Fidha Accounts
        </p>
      </motion.div>
    </div>
  );
}