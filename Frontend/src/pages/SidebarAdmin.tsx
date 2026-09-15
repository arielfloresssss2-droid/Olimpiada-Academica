import "../styles/SidebarAdmin.css";

type SidebarAdminProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
};

function SidebarAdmin({
  activeSection,
  setActiveSection,
}: SidebarAdminProps) {
  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside className="sidebar-admin-desktop">
        <div>
          <div className="sidebar-admin-top">
            <div className="sidebar-admin-logo">
              <img src="/logo.svg" alt="Logo" />
            </div>

            <div className="sidebar-admin-school">
              <h1>E.E.S.T. N°6</h1>
              <p>Chacabuco</p>
              <p>MORÓN</p>
            </div>
          </div>

          <div className="sidebar-admin-section-title">
            <span>ADMINISTRACIÓN</span>
          </div>

          <nav className="sidebar-admin-nav">
            {/* INICIO */}

            <button
              onClick={() => setActiveSection("inicio")}
              className={`sidebar-admin-link ${
                activeSection === "inicio"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/home.svg" alt="Inicio" />
              <span>Inicio</span>
            </button>

            {/* GESTIONAR MENÚ */}

            <button
              onClick={() => setActiveSection("menu")}
              className={`sidebar-admin-link ${
                activeSection === "menu"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/food.svg" alt="Gestionar Menú" />
              <span>Gestionar Menú</span>
            </button>

            {/* ESTADÍSTICAS */}

            <button
              onClick={() => setActiveSection("estadisticas")}
              className={`sidebar-admin-link ${
                activeSection === "estadisticas"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/statistics.svg" alt="Estadísticas" />
              <span>Estadísticas</span>
            </button>

            {/* RESERVAS */}

            <button
              onClick={() => setActiveSection("reservas")}
              className={`sidebar-admin-link ${
                activeSection === "reservas"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/calendar.svg" alt="Reservas" />
              <span>Gestionar Reservas</span>
            </button>

            {/* PERFIL */}

            <button
              onClick={() => setActiveSection("perfil")}
              className={`sidebar-admin-link ${
                activeSection === "perfil"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/person-log.svg" alt="Perfil" />
              <span>Mi perfil</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-admin-bottom">
          <div className="sidebar-admin-info-card">
            <div className="sidebar-admin-info-icon">⚙</div>

            <div>
              <h4>Panel Administrativo</h4>

              <p>
                Gestioná menús, reservas y estadísticas del buffet.
              </p>
            </div>
          </div>

          <div className="sidebar-admin-footer">
            <p>Sistema Buffet Escolar</p>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE NAVBAR ================= */}

      <nav className="mobile-admin-navbar">
        <button
          onClick={() => setActiveSection("inicio")}
          className={`mobile-admin-link ${
            activeSection === "inicio"
              ? "mobile-admin-link-active"
              : ""
          }`}
        >
          <img src="/home.svg" alt="Inicio" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => setActiveSection("menu")}
          className={`mobile-admin-link ${
            activeSection === "menu"
              ? "mobile-admin-link-active"
              : ""
          }`}
        >
          <img src="/food.svg" alt="Menú" />
          <span>Menú</span>
        </button>

        <button
          onClick={() => setActiveSection("estadisticas")}
          className={`mobile-admin-link ${
            activeSection === "estadisticas"
              ? "mobile-admin-link-active"
              : ""
          }`}
        >
          <img src="/statistics.svg" alt="Estadísticas" />
          <span>Stats</span>
        </button>

        <button
          onClick={() => setActiveSection("reservas")}
          className={`mobile-admin-link ${
            activeSection === "reservas"
              ? "mobile-admin-link-active"
              : ""
          }`}
        >
          <img src="/calendar.svg" alt="Reservas" />
          <span>Reservas</span>
        </button>

        <button
          onClick={() => setActiveSection("perfil")}
          className={`mobile-admin-link ${
            activeSection === "perfil"
              ? "mobile-admin-link-active"
              : ""
          }`}
        >
          <img src="/person-log.svg" alt="Perfil" />
          <span>Perfil</span>
        </button>
      </nav>
    </>
  );
}

export default SidebarAdmin;