import { motion } from "framer-motion";

const buttonStyle = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "none",
  background: "linear-gradient(135deg,#0044ff,#6699ff)",
  color: "white",
  boxShadow: "0 0 15px rgba(0,100,255,0.5)",
  cursor: "pointer",
};

export default function SearchBar({ search, setSearch, onSearch }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        display: "flex",
        gap: "10px",
        borderRadius: "30px",
        padding: "12px 20px",
        border: "2px solid rgba(0,100,255,0.4)",
        boxShadow: "0 0 15px rgba(0,100,255,0.3)",
      }}
    >
      <input
        placeholder="Search Admission No"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        style={{ border: "none", outline: "none", background: "transparent" }}
      />

      <button style={buttonStyle} onClick={onSearch}>
        Search
      </button>
    </motion.div>
  );
}