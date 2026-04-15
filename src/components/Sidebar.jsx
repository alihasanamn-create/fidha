import { useState } from "react";
import { motion } from "framer-motion";

export default function Sidebar({ setMode }) {
  const [active, setActive] = useState("dashboard");

  const menu = [
    { name: "Dashboard", key: "admin",  },
    { name: "Parent View", key: "parent", },
  ];

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        background: "linear-gradient(180deg,#002266,#0044ff)",
        color: "white",
        padding: "20px",
        position: "fixed",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>Fidha</h2>

      {menu.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setMode(item.key);
            setActive(item.key);
          }}
          style={{
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "10px",
            cursor: "pointer",
            background:
              active === item.key
                ? "rgba(255,255,255,0.2)"
                : "transparent",
          }}
        >
          {item.icon} {item.name}
        </motion.div>
      ))}
    </div>
  );
}