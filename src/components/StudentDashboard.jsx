import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function StudentDashboard({ student }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(
        collection(db, "payments"),
        where("studentId", "==", student.id)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());

      setHistory(data.reverse());
    };

    fetchHistory();
  }, [student]);

  return (
    <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
      
      {/* LEFT SIDE */}
      <motion.div
        style={{
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.3)",
          backdropFilter: "blur(10px)",
          width: "300px",
        }}
      >
        <h2>{student.name}</h2>
        <p>Balance: ₹{student.balance}</p>
      </motion.div>

      {/* RIGHT SIDEBAR HISTORY */}
      <div
        style={{
          width: "300px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <h3>Transaction History</h3>

        {history.map((item, i) => (
          <motion.div
            key={i}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "10px",
              background:
                item.type === "add"
                  ? "rgba(0,200,0,0.2)"
                  : "rgba(255,0,0,0.2)",
              color: item.type === "add" ? "green" : "red",
            }}
          >
            <strong>₹{item.amount}</strong>
            <br />
            <small>{item.reason}</small>
            <br />
            <small>
              {item.date?.seconds
                ? new Date(item.date.seconds * 1000).toLocaleDateString()
                : ""}
            </small>
          </motion.div>
        ))}
      </div>
    </div>
  );
}