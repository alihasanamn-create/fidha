import { motion } from "framer-motion";
import {
  BarChart3,
  GraduationCap,
  Download,
  UsersRound,
  LogOut,
} from "lucide-react";

export default function Sidebar({
  setMode,
  activeMode,
  onLogout,
}) {
  const menuItems = [
    {
      key: "admin",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      key: "s1",
      label: "S1",
      icon: GraduationCap,
    },
    {
      key: "s2",
      label: "S2",
      icon: GraduationCap,
    },
    {
      key: "s3",
      label: "S3",
      icon: GraduationCap,
    },
    {
      key: "s4",
      label: "S4",
      icon: GraduationCap,
    },
    {
      key: "downloads",
      label: "Downloads",
      icon: Download,
    },
    {
      key: "parent",
      label: "Parent View",
      icon: UsersRound,
    },
  ];

  return (
    <aside className="app-sidebar">
      {/* BRAND */}

      <div className="sidebar-brand">
        <div className="brand-logo">
          F
        </div>

        <div>
          <h2>Fidha Accounts</h2>
          <span>SMAC Management</span>
        </div>
      </div>

      {/* MENU */}

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            activeMode === item.key ||
            (
              item.key === "admin" &&
              !activeMode
            );

          return (
            <motion.button
              key={item.key}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setMode(item.key)
              }
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
            >
              <span className="sidebar-icon">
                <Icon size={19} strokeWidth={2} />
              </span>

              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* USER */}

      <div className="sidebar-user">
        <div className="user-avatar">
          A
        </div>

        <div>
          <strong>
            Administrator
          </strong>

          <span>
            SMAC Accounts
          </span>
        </div>
      </div>

      {/* LOGOUT */}

      <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.97 }}
        onClick={onLogout}
        className="sidebar-logout"
      >
        <LogOut
          size={18}
          strokeWidth={2}
        />

        <span>Logout</span>
      </motion.button>
    </aside>
  );
}