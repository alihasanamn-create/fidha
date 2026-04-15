import { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function AdminParentView() {
  const [adNo, setAdNo] = useState("");
  const [student, setStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const search = async () => {
    const q = query(collection(db, "students"), where("adNo", "==", adNo));
    const snap = await getDocs(q);

    if (snap.empty) return alert("Not found");

    const docData = snap.docs[0];
    setStudent({ id: docData.id, ...docData.data() });

    const tq = query(collection(db, "payments"), where("studentId", "==", docData.id));
    const tsnap = await getDocs(tq);

    setTransactions(tsnap.docs.map((d) => d.data()));
  };

  return (
    <div>
      <h2>Parent Preview</h2>

      <input
        placeholder="Admission No"
        value={adNo}
        onChange={(e) => setAdNo(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && search()}
      />

      <button onClick={search}>Search</button>

      {student && (
        <div style={{ marginTop: "20px" }}>
          {/* BALANCE BOX */}
          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              border: "2px solid #0044ff",
              background: "rgba(255,255,255,0.2)",
              marginBottom: "20px",
            }}
          >
            <h3>{student.name}</h3>
            <h2>₹ {student.balance}</h2>
          </div>

          {/* TRANSACTIONS */}
          {transactions.map((t, i) => (
            <div
              key={i}
              style={{
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "10px",
                background: t.type === "add" ? "#d4edda" : "#f8d7da",
              }}
            >
              ₹{t.amount} - {t.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}