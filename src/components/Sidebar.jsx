import { motion } from "framer-motion";

export default function Sidebar({
  setMode,
  activeMode,
  onLogout,
}) {
  const menu = [
    {
      name: "Dashboard",
      key: "admin",
      icon: "⌂",
    },
    {
      name: "S1",
      key: "s1",
      icon: "S1",
    },
    {
      name: "S2",
      key: "s2",
      icon: "S2",
    },
    {
      name: "Downloads",
      key: "downloads",
      icon: "↓",
    },
    {
      name: "Parent View",
      key: "parent",
      icon: "◉",
    },
  ];

  return (
    <>
      <aside className="sidebar">

        {/* Logo */}

        <div className="sidebar-logo">

          <div className="logo-circle">
            F
          </div>

          <div>
            <h2>FIDHA</h2>
            <span>ACCOUNTS</span>
          </div>

        </div>


        {/* College */}

        <div className="sidebar-college">

          <strong>SMAC</strong>

          <span>
            Siddeeq Moula Arabic College
          </span>

        </div>


        {/* Navigation */}

        <nav className="sidebar-menu">

          {menu.map((item) => {

            const active =
              activeMode === item.key;

            return (
              <motion.button
                key={item.key}
                type="button"
                className={`sidebar-item ${
                  active ? "active" : ""
                }`}
                onClick={() =>
                  setMode(item.key)
                }
                whileHover={{
                  x: 4,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>

              </motion.button>
            );

          })}

        </nav>


        {/* Bottom */}

        <div className="sidebar-bottom">

          <div className="admin-profile">

            <div className="profile-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <span>
                Account Manager
              </span>
            </div>

          </div>


          <motion.button
            type="button"
            className="logout-button"
            onClick={onLogout}
            whileHover={{
              scale: 1.03,
              x: 3,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            <span>↪</span>
            Logout
          </motion.button>

        </div>

      </aside>


      <style>{`

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;

          width: 245px;

          padding:
            25px 18px;

          display: flex;
          flex-direction: column;

          background:
            linear-gradient(
              180deg,
              #063b46 0%,
              #07515b 55%,
              #063b46 100%
            );

          color: white;

          z-index: 1000;

          box-sizing: border-box;

          box-shadow:
            8px 0 30px
            rgba(0,0,0,.08);
        }


        .sidebar-logo {
          display: flex;
          align-items: center;

          gap: 12px;

          padding:
            4px 8px 22px;
        }


        .logo-circle {
          width: 45px;
          height: 45px;

          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: white;

          color: #07515b;

          font-size: 22px;

          font-weight: 800;

          box-shadow:
            0 8px 20px
            rgba(0,0,0,.15);
        }


        .sidebar-logo h2 {
          margin: 0;

          font-size: 20px;

          letter-spacing: 1px;
        }


        .sidebar-logo span {
          display: block;

          margin-top: 2px;

          font-size: 9px;

          letter-spacing: 2px;

          opacity: .65;
        }


        .sidebar-college {
          padding: 15px;

          margin-bottom: 22px;

          border-radius: 16px;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.08);
        }


        .sidebar-college strong {
          display: block;

          font-size: 13px;

          letter-spacing: 1px;
        }


        .sidebar-college span {
          display: block;

          margin-top: 4px;

          font-size: 10px;

          line-height: 1.5;

          opacity: .65;
        }


        .sidebar-menu {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .sidebar-item {
          width: 100%;

          border: 0;

          outline: 0;

          cursor: pointer;

          color:
            rgba(255,255,255,.72);

          background:
            transparent;

          display: flex;

          align-items: center;

          gap: 13px;

          padding:
            12px 14px;

          border-radius: 13px;

          font-size: 13px;

          text-align: left;

          transition:
            background .2s ease,
            color .2s ease,
            box-shadow .2s ease;
        }


        .sidebar-item:hover {
          color: white;

          background:
            rgba(255,255,255,.10);
        }


        .sidebar-item.active {
          color: #063b46;

          background: white;

          box-shadow:
            0 8px 20px
            rgba(0,0,0,.12);
        }


        .sidebar-icon {
          width: 29px;
          height: 29px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(255,255,255,.08);

          font-size: 12px;

          font-weight: 800;
        }


        .sidebar-item.active
        .sidebar-icon {
          background: #e4f6f0;

          color: #07956d;
        }


        .sidebar-bottom {
          margin-top: auto;
        }


        .admin-profile {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 13px;

          margin-bottom: 12px;

          border-radius: 15px;

          background:
            rgba(255,255,255,.07);
        }


        .profile-avatar {
          width: 36px;
          height: 36px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #07956d;

          font-weight: 700;
        }


        .admin-profile strong {
          display: block;

          font-size: 12px;
        }


        .admin-profile span {
          display: block;

          margin-top: 2px;

          font-size: 9px;

          opacity: .55;
        }


        .logout-button {
          width: 100%;

          border:
            1px solid
            rgba(255,255,255,.12);

          border-radius: 12px;

          padding: 11px;

          background:
            rgba(255,255,255,.06);

          color: white;

          cursor: pointer;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          font-size: 13px;
        }


        .logout-button:hover {
          background:
            rgba(255,255,255,.13);
        }


        @media (max-width: 800px) {

          .sidebar {
            width: 75px;

            padding:
              18px 10px;
          }


          .sidebar-logo {
            justify-content:
              center;
          }


          .sidebar-logo > div:last-child,
          .sidebar-college,
          .sidebar-item span:last-child,
          .admin-profile > div:last-child,
          .logout-button {
            display: none;
          }


          .sidebar-item {
            justify-content:
              center;

            padding: 12px;
          }


          .admin-profile {
            justify-content:
              center;
          }


          .admin-content {
            margin-left:
              75px !important;
          }

        }

      `}</style>
    </>
  );
}