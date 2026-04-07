import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentCard({
  student,
  amount,
  setAmount,
  onPay,
}) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(
        collection(db, "payments"),
        where("studentId", "==", student.id)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());

      setHistory(data);
    };

    fetchHistory();
  }, [student]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        marginTop: "25px",
        padding: "25px",
        borderRadius: "20px",
        backdropFilter: "blur(15px)",
        background: "rgba(255,255,255,0.3)",
        boxShadow: "0 0 25px rgba(0,150,255,0.3)",
      }}
    >
      <h2>{student.name}</h2>
      <p>Balance: ₹{student.balance}</p>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br /><br />

      <button onClick={onPay}>Pay</button>

      <h3>Payment History</h3>

      {history.map((item, index) => (
        <p key={index}>
          ₹{item.amount} -{" "}
          {item.date?.seconds
            ? new Date(item.date.seconds * 1000).toLocaleDateString()
            : "Today"}
        </p>
      ))}
    </motion.div>
  );
}