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
              <h1>Municipio de Morón</h1>
              <p>Panel de Administración</p>
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

            {/* GESTIONAR SERVICIOS / CATEGORÍAS */}

            <button
              onClick={() => setActiveSection("menu")}
              className={`sidebar-admin-link ${
                activeSection === "menu"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/support.svg" alt="Gestionar Servicios" />
              <span>Gestionar Servicios</span>
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

            {/* INCIDENTES */}

            <button
              onClick={() => setActiveSection("reservas")}
              className={`sidebar-admin-link ${
                activeSection === "reservas"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/calendar.svg" alt="Gestionar Incidentes" />
              <span>Gestionar Incidentes</span>
            </button>

            {/* AUDITORÍA */}

            <button
              onClick={() => setActiveSection("auditoria")}
              className={`sidebar-admin-link ${
                activeSection === "auditoria"
                  ? "sidebar-admin-link-active"
                  : ""
              }`}
            >
              <img src="/history.svg" alt="Log de Auditoría" />
              <span>Log de Auditoría</span>
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
                Gestioná servicios, incidentes reportados y estadísticas de Morón.
              </p>
            </div>
          </div>

          <div className="sidebar-admin-footer">
            <p>Sistema de Incidentes · Morón</p>
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
          <img src="/support.svg" alt="Servicios" />
          <span>Servicios</span>
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
          <img src="/calendar.svg" alt="Incidentes" />
          <span>Incidentes</span>
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