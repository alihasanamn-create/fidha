import { motion } from "framer-motion";

export default function StudentDashboard({ student }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        marginLeft: "240px",
        padding: "20px",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(15px)",
          boxShadow: "0 0 30px rgba(0,100,255,0.3)",
        }}
      >
        <h2>{student.name}</h2>
        <p>Balance: ₹{student.balance}</p>
      </div>
    </motion.div>
  );
}