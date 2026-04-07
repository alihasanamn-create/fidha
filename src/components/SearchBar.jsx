import { motion } from "framer-motion";

export default function SearchBar({ search, setSearch, onSearch }) {
  return (
    <motion.div
      whileTap={{ scale: 1.1 }}
      style={{
        borderRadius: "30px",
        padding: "12px 20px",
        backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.3)",
        boxShadow: "0 0 20px rgba(0,150,255,0.3)",
      }}
    >
      <input
        placeholder="Search Admission No..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          width: "250px",
          fontSize: "16px",
        }}
      />
    </motion.div>
  );
}