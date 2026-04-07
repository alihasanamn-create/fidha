import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", amount: 400 },
  { name: "Feb", amount: 800 },
  { name: "Mar", amount: 600 },
  { name: "Apr", amount: 1200 },
];

export default function DashboardHome() {
  return (
    <div style={{ padding: "20px" }}>
      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {[
          { title: "Total Students", value: "86" },
          { title: "Active", value: "75" },
          { title: "Collected", value: "45673" },
          { title: "Pending", value: "93" },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "20px",
              borderRadius: "20px",
              width: "200px",
              background: "rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 20px rgba(0,150,255,0.3)",
            }}
          >
            <h4>{card.title}</h4>
            <h2>{card.value}</h2>
          </motion.div>
        ))}
      </div>

      {/* CHART */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.3)",
        }}
      >
        <h3>Fees Overview</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}