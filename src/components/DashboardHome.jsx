import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

import AnimatedCounter from "./AnimatedCounter";

export default function DashboardHome() {
  const [data, setData] = useState([]);

  const [stats, setStats] = useState({
    students: 0,
    collected: 0,
    pending: 0,
  });

  useEffect(() => {
    // 🔥 REAL-TIME STUDENTS
    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const students = snapshot.docs.map((doc) => doc.data());

        const totalPending = students.reduce(
          (sum, s) => sum + (s.balance || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          students: students.length,
          pending: totalPending,
        }));
      }
    );

    // 🔥 REAL-TIME PAYMENTS
    const unsubPayments = onSnapshot(
      collection(db, "payments"),
      (snapshot) => {
        const payments = snapshot.docs.map((doc) => doc.data());

        let totalCollected = 0;
        let monthly = {};

        payments.forEach((p) => {
          if (p.type === "add") {
            totalCollected += p.amount;

            const date = p.date?.seconds
              ? new Date(p.date.seconds * 1000)
              : new Date();

            const month = date.toLocaleString("default", {
              month: "short",
            });

            monthly[month] = (monthly[month] || 0) + p.amount;
          }
        });

        const chartData = Object.keys(monthly).map((m) => ({
          name: m,
          amount: monthly[m],
        }));

        setStats((prev) => ({
          ...prev,
          collected: totalCollected,
        }));

        setData(chartData);
      }
    );

    return () => {
      unsubStudents();
      unsubPayments();
    };
  }, []);

  return (
    <div style={{ marginLeft: "240px", padding: "20px" }}>
      <h2>Dashboard (Live)</h2>

      {/* 🔷 STATS CARDS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {[
          { title: "Students", value: stats.students },
          { title: "Collected", value: stats.collected },
          { title: "Pending", value: stats.pending },
        ].map((c, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
            style={{
              padding: "20px",
              borderRadius: "20px",
              width: "200px",
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(15px)",
              boxShadow: "0 0 25px rgba(0,100,255,0.4)",
            }}
          >
            <h4>{c.title}</h4>

            <h2>
              <AnimatedCounter value={c.value} />
            </h2>
          </motion.div>
        ))}
      </div>

      {/* 📊 LIVE CHART */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.3)",
          boxShadow: "0 0 20px rgba(0,100,255,0.3)",
        }}
      >
        <h3>Live Fee Collection</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#0044ff"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}