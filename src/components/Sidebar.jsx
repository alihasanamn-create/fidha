import { motion } from "framer-motion";

export default function Sidebar({
  setMode,
  activeMode,
  onLogout,
}) {
  const menuItems = [
    {
      key: "admin",
      label: "Dashboard",
      icon: "📊",
    },
    {
      key: "s1",
      label: "S1",
      icon: "🎓",
    },
    {
      key: "s2",
      label: "S2",
      icon: "🎓",
    },
    {
      key: "s3",
      label: "S3",
      icon: "🎓",
    },
    {
      key: "s4",
      label: "S4",
      icon: "🎓",
    },
    {
      key: "downloads",
      label: "Downloads",
      icon: "📥",
    },
    {
      key: "parent",
      label: "Parent View",
      icon: "👨‍👩‍👧",
    },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          F
        </div>

        <div>
          <h2>Fidha Accounts</h2>
          <span>SMAC Management</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <motion.button
            key={item.key}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode(item.key)}
            className={`sidebar-item ${
              activeMode === item.key ? "active" : ""
            }`}
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">
          A
        </div>

        <div>
          <strong>Administrator</strong>
          <span>SMAC Accounts</span>
        </div>
      </div>

      {/* Logout */}
      <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.97 }}
        onClick={onLogout}
        className="sidebar-logout"
      >
        <span>🚪</span>
        <span>Logout</span>
      </motion.button>
    </aside>
  );
}