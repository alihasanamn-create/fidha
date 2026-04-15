import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { generateReceipt } from "./utils/generateReceipt";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [adNo, setAdNo] = useState("");
  const [className, setClassName] = useState("");
  const [balance, setBalance] = useState("");

  // 📡 REALTIME
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setStudents(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  // ➕ ADD STUDENT
  const handleAdd = async () => {
    if (!name || !adNo) return alert("Fill all");

    await addDoc(collection(db, "students"), {
      name,
      adNo,
      className,
      balance: Number(balance || 0),
      password: adNo,
    });

    alert(`Login:\n${adNo} / ${adNo}`);

    setName("");
    setAdNo("");
    setClassName("");
    setBalance("");
  };

  // ❌ DELETE
  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, "students", id));
  };

  // 🔄 FORM PER STUDENT
  const handleChange = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // 💰 TRANSACTION
  const handleTransaction = async (student) => {
    const data = form[student.id] || {};
    const amount = Number(data.amount);
    const reason = data.reason;
    const type = data.type || "add";

    if (!amount || !reason) return alert("Fill all");

    const newBalance =
      type === "add"
        ? student.balance + amount
        : student.balance - amount;

    await updateDoc(doc(db, "students", student.id), {
      balance: newBalance,
    });

    await addDoc(collection(db, "payments"), {
      studentId: student.id,
      amount,
      reason,
      type,
      date: new Date().toLocaleDateString(),
    });

    setForm((prev) => ({ ...prev, [student.id]: {} }));
  };

  // 📄 CSV IMPORT
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const rows = event.target.result.split("\n").slice(1);

      for (let row of rows) {
        const [name, adNo, className] = row.split(",");

        if (!name || !adNo) continue;

        await addDoc(collection(db, "students"), {
          name: name.trim(),
          adNo: adNo.trim(),
          className: className?.trim() || "",
          balance: 0,
          password: adNo.trim(),
        });
      }

      alert("CSV Imported");
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* SEARCH */}
      <input
        placeholder="Search by name or Ad No"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CSV */}
      <input type="file" accept=".csv" onChange={handleCSVUpload} />

      {/* ADD STUDENT */}
      <div>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Ad No" value={adNo} onChange={(e) => setAdNo(e.target.value)} />
        <input placeholder="Class" value={className} onChange={(e) => setClassName(e.target.value)} />
        <input placeholder="Balance" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <button onClick={handleAdd}>Add Student</button>
      </div>

      {/* STUDENTS */}
      {students
        .filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.adNo.includes(search)
        )
        .map((s) => {
          const f = form[s.id] || {};

          return (
            <div key={s.id} style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
              <h3>{s.name}</h3>
              <p>{s.adNo} | {s.className}</p>
              <p>₹{s.balance}</p>

              <button onClick={() => deleteStudent(s.id)}>Delete</button>

              {/* TRANSACTION */}
              <div style={{ border: "1px dashed blue", padding: "10px" }}>
                <input
                  placeholder="Amount"
                  value={f.amount || ""}
                  onChange={(e) => handleChange(s.id, "amount", e.target.value)}
                />

                <input
                  placeholder="Reason"
                  value={f.reason || ""}
                  onChange={(e) => handleChange(s.id, "reason", e.target.value)}
                />

                <select
                  value={f.type || "add"}
                  onChange={(e) => handleChange(s.id, "type", e.target.value)}
                >
                  <option value="add">Add</option>
                  <option value="deduct">Deduct</option>
                </select>

                <button onClick={() => handleTransaction(s)}>
                  Update Balance
                </button>

                <button
                  onClick={() =>
                    generateReceipt({
                      studentName: s.name,
                      amount: f.amount,
                      reason: f.reason,
                      type: f.type || "add",
                      date: new Date().toLocaleDateString(),
                    })
                  }
                >
                  Download Receipt
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}