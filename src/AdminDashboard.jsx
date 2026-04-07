import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import DashboardHome from "./components/DashboardHome";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [adNo, setAdNo] = useState("");
  const [balance, setBalance] = useState("");

  const [editId, setEditId] = useState(null);

  // FETCH
  const fetchStudents = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ADD / UPDATE
  const handleSave = async () => {
    if (!name || !adNo || !balance) {
      alert("Fill all fields");
      return;
    }

    if (editId) {
      await updateDoc(doc(db, "students", editId), {
        name,
        adNo,
        balance: Number(balance),
      });
      setEditId(null);
    } else {
      await addDoc(collection(db, "students"), {
        name,
        adNo,
        balance: Number(balance),
      });
    }

    setName("");
    setAdNo("");
    setBalance("");

    fetchStudents();
  };

  // DELETE
  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, "students", id));
    fetchStudents();
  };

  // EDIT
  const editStudent = (student) => {
    setName(student.name);
    setAdNo(student.adNo);
    setBalance(student.balance);
    setEditId(student.id);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg, #ffe6f0, #e6f0ff)",
      }}
    >
      {/* DASHBOARD CARDS + CHART */}
      <DashboardHome />

      <h2 style={{ textAlign: "center", marginTop: "20px" }}>
        Manage Students
      </h2>

      {/* FORM */}
      <motion.div
        style={{
          margin: "20px auto",
          padding: "20px",
          width: "300px",
          borderRadius: "20px",
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.3)",
          boxShadow: "0 0 25px rgba(0,150,255,0.3)",
        }}
      >
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <input
          placeholder="Admission No"
          value={adNo}
          onChange={(e) => setAdNo(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <input
          type="number"
          placeholder="Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(135deg, #66ccff, #ff99cc)",
            color: "white",
          }}
        >
          {editId ? "Update Student" : "Add Student"}
        </button>
      </motion.div>

      {/* STUDENT LIST */}
      {students.map((student) => (
        <motion.div
          key={student.id}
          style={{
            margin: "10px auto",
            padding: "15px",
            width: "300px",
            borderRadius: "15px",
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 15px rgba(0,150,255,0.3)",
          }}
        >
          <h3>{student.name}</h3>
          <p>Ad No: {student.adNo}</p>
          <p>Balance: ₹{student.balance}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => editStudent(student)}
              style={{
                flex: 1,
                padding: "5px",
                borderRadius: "10px",
                border: "none",
                background: "#66ccff",
                color: "white",
              }}
            >
              Edit
            </button>

            <button
              onClick={() => deleteStudent(student.id)}
              style={{
                flex: 1,
                padding: "5px",
                borderRadius: "10px",
                border: "none",
                background: "#ff4d6d",
                color: "white",
              }}
            >
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}