import "../styles/Sidebar.css";

type SidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
};

function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <>
      <aside className="sidebar-desktop">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <img src="/logo.svg" alt="Logo" />
          </div>

          <div className="sidebar-school">
            <h1>Municipio de Morón</h1>
            <p>Soporte de Incidentes</p>
            <p>MORÓN</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* INICIO */}

          <button
            onClick={() => setActiveSection("inicio")}
            className={`sidebar-link ${
              activeSection === "inicio" ? "sidebar-link-active" : ""
            }`}
          >
            <img src="/home.svg" alt="Inicio" />
            <span>Inicio</span>
          </button>

          {/* REPORTAR INCIDENTE */}

          <button
            onClick={() => setActiveSection("reservar")}
            className={`sidebar-link ${
              activeSection === "reservar" ? "sidebar-link-active" : ""
            }`}
          >
            <img src="/support.svg" alt="Reportar Incidente" />
            <span>Reportar incidente</span>
          </button>

          {/* MIS INCIDENTES */}

          <button
            onClick={() => setActiveSection("reservas")}
            className={`sidebar-link ${
              activeSection === "reservas" ? "sidebar-link-active" : ""
            }`}
          >
            <img src="/calendar.svg" alt="Mis incidentes" />
            <span>Mis incidentes</span>
          </button>

          {/* HISTORIAL */}

          <button
            onClick={() => setActiveSection("historial")}
            className={`sidebar-link ${
              activeSection === "historial" ? "sidebar-link-active" : ""
            }`}
          >
            <img src="/history.svg" alt="Historial" />
            <span>Historial</span>
          </button>

          {/* PERFIL */}

          <button
            onClick={() => setActiveSection("perfil")}
            className={`sidebar-link ${
              activeSection === "perfil" ? "sidebar-link-active" : ""
            }`}
          >
            <img src="/person-log.svg" alt="Perfil" />
            <span>Mi perfil</span>
          </button>

        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-reminder-card">
            <div className="sidebar-reminder-icon">🛡️</div>

            <div>
              <h4>Atención Morón</h4>

              <p>Reportá incidentes urbanos las 24 hs.</p>
            </div>
          </div>

          <div className="sidebar-footer">
            <p>Sistema de Incidentes · Morón</p>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}

      <nav className="mobile-navbar">
        <button
          onClick={() => setActiveSection("inicio")}
          className={`mobile-link ${
            activeSection === "inicio" ? "mobile-link-active" : ""
          }`}
        >
          <img src="/home.svg" alt="Inicio" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => setActiveSection("reservar")}
          className={`mobile-link ${
            activeSection === "reservar" ? "mobile-link-active" : ""
          }`}
        >
          <img src="/support.svg" alt="Reportar" />
          <span>Reportar</span>
        </button>

        <button
          onClick={() => setActiveSection("reservas")}
          className={`mobile-link ${
            activeSection === "reservas" ? "mobile-link-active" : ""
          }`}
        >
          <img src="/calendar.svg" alt="Incidentes" />
          <span>Incidentes</span>
        </button>

          <button
            onClick={() => setActiveSection("historial")}
            className={`mobile-link ${
              activeSection === "historial" ? "mobile-link-active" : ""
            }`}
          >
            <img src="/history.svg" alt="Historial" />
            <span>Historial</span>
          </button>

        <button
          onClick={() => setActiveSection("perfil")}
          className={`mobile-link ${
            activeSection === "perfil" ? "mobile-link-active" : ""
          }`}
        >
          <img src="/person-log.svg" alt="Perfil" />
          <span>Perfil</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;
