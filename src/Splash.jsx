import { motion } from "framer-motion";

export default function Splash() {
  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#002266,#0044ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        color: "white",
      }}
    >
      {/* 🔥 LOGO ANIMATION */}
      <motion.img
        src="/logo.png" // 👉 put your image in public folder
        alt="logo"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1.2, rotate: 360 }}
        transition={{ duration: 1 }}
        style={{ width: "120px", marginBottom: "20px" }}
      />

      {/* TEXT */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Fidha Accounts
      </motion.h1>
    </div>
  );
}