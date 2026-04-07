import { useState } from "react";
import Login from "./Login";
import SearchBar from "./components/SearchBar";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";

import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";
import jsPDF from "jspdf";

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("admin");

  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("deduct");

  if (!user) return <Login setUser={setUser} />;

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleSearch = async () => {
    const q = query(
      collection(db, "students"),
      where("adNo", "==", search)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Student not found");
      setResult(null);
      return;
    }

    snapshot.forEach((docItem) => {
      setResult({ id: docItem.id, ...docItem.data() });
    });
  };

  const generateReceipt = () => {
    const doc = new jsPDF();

    doc.text("Fidha Accounts Receipt", 20, 20);
    doc.text(`Name: ${result.name}`, 20, 30);
    doc.text(`Amount: ₹${amount}`, 20, 40);
    doc.text(`Reason: ${reason}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    doc.save("receipt.pdf");
  };

  const handleTransaction = async () => {
    let newBalance =
      type === "add"
        ? result.balance + Number(amount)
        : result.balance - Number(amount);

    const ref = doc(db, "students", result.id);

    await updateDoc(ref, { balance: newBalance });

    await addDoc(collection(db, "payments"), {
      studentId: result.id,
      name: result.name,
      amount: Number(amount),
      type,
      reason,
      date: new Date(),
    });

    setResult({ ...result, balance: newBalance });

    generateReceipt();

    setAmount("");
    setReason("");
  };

  if (mode === "admin") {
    return (
      <div>
        <div
          style={{
            padding: "10px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            background: "linear-gradient(135deg, #ffe6f0, #e6f0ff)",
          }}
        >
          <button onClick={() => setMode("parent")}>
            Parent View
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <AdminDashboard />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg, #ffe6f0, #e6f0ff)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={() => setMode("admin")}>Admin View</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h1 style={{ textAlign: "center" }}>Fidha Accounts</h1>

      <SearchBar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
      />

      {result && (
        <>
          <StudentDashboard student={result} />

          <div style={{ marginTop: "20px" }}>
            <select onChange={(e) => setType(e.target.value)}>
              <option value="deduct">Deduct</option>
              <option value="add">Add</option>
            </select>

            <input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <button onClick={handleTransaction}>
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}