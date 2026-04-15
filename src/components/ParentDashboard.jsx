import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function ParentDashboard({ user, setUser }) {
  const [transactions, setTransactions] = useState([]);
  const student = user.student;

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(
        collection(db, "payments"),
        where("studentId", "==", user.id)
      );

      const snap = await getDocs(q);

      setTransactions(snap.docs.map((d) => d.data()));
    };

    fetchTransactions();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setUser(null)}>Logout</button>

      {/* 🔷 BALANCE CARD */}
      <div
        style={{
          padding: "25px",
          borderRadius: "20px",
          border: "2px solid rgba(0,100,255,0.5)",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <h3>{student.name}</h3>
        <h1>₹ {student.balance}</h1>
      </div>

      {/* 🔶 TRANSACTIONS */}
      <h3>Transactions</h3>

      {transactions.map((t, i) => (
        <div
          key={i}
          style={{
            padding: "12px",
            borderRadius: "15px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            background:
              t.type === "add"
                ? "rgba(0,200,0,0.15)"
                : "rgba(255,0,0,0.15)",
          }}
        >
          <h4>₹ {t.amount}</h4>
          <p>{t.reason}</p>
        </div>
      ))}
    </div>
  );
}