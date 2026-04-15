import { useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Login({ setUser }) {
  const [mode, setMode] = useState("admin"); // admin first
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // 👨‍👩‍👦 PARENT LOGIN
    if (mode === "parent") {
      const q = query(
        collection(db, "students"),
        where("adNo", "==", username)
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
    }

    // 👨‍💼 ADMIN LOGIN
    if (mode === "admin") {
      if (username === "admin" && password === "admin123") {
        setUser({ role: "admin" });
      } else {
        alert("Invalid admin login");
      }
    }
  };

  return (
    <div style={pageStyle}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={cardStyle}
      >
        <h2 style={{ marginBottom: "20px" }}>
          {mode === "admin" ? "Admin Login" : "Parent Login"}
        </h2>

        {/* MODE SWITCH */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setMode("admin")}
            style={{
              ...tabStyle,
              background: mode === "admin" ? "#0044ff" : "transparent",
              color: mode === "admin" ? "white" : "#0044ff",
            }}
          >
            Admin
          </button>

          <button
            onClick={() => setMode("parent")}
            style={{
              ...tabStyle,
              background: mode === "parent" ? "#0044ff" : "transparent",
              color: mode === "parent" ? "white" : "#0044ff",
            }}
          >
            Parent
          </button>
        </div>

        {/* INPUTS */}
        <motion.input
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
          placeholder={
            mode === "parent" ? "Admission No" : "Username"
          }
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <motion.input
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* LOGIN BUTTON */}
        <motion.button
          whileHover={{
            scale: 1.08,
            boxShadow: "0 0 20px rgba(0,100,255,0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          style={btnStyle}
        >
          Login
        </motion.button>
      </motion.div>
    </div>
  );
}

/* 🎨 STYLES */

const pageStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg,#e6ecff,#f5f7ff)",
};

const cardStyle = {
  padding: "40px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.25)",
  backdropFilter: "blur(15px)",
  boxShadow: "0 0 40px rgba(0,100,255,0.2)",
  width: "300px",
  textAlign: "center",
};

const tabStyle = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "2px solid #0044ff",
  marginRight: "10px",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "20px",
  border: "2px solid rgba(0,100,255,0.5)",
  background: "transparent",
  outline: "none",
  transition: "0.3s",
};

const btnStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "20px",
  border: "none",
  background: "linear-gradient(135deg,#0044ff,#6699ff)",
  color: "white",
  cursor: "pointer",
};