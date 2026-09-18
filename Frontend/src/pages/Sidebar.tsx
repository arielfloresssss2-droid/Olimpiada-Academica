import "../styles/Sidebar.css";

type SidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
};

const NAV_ITEMS = [
  { key: "inicio", label: "Inicio", icon: "/home.svg" },
  { key: "reservar", label: "Reportar incidente", icon: "/support.svg" },
  { key: "reservas", label: "Mis incidentes", icon: "/calendar.svg" },
  { key: "historial", label: "Historial", icon: "/history.svg" },
  { key: "perfil", label: "Mi perfil", icon: "/person-log.svg" },
];

function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <>
      {/* TOPBAR (antes sidebar) */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <div className="topbar-logo">
              <img src="/logo.svg" alt="Logo" />
            </div>

            <div className="topbar-brand-text">
              <h1>Municipio de Morón</h1>
              <p>Soporte de Incidentes</p>
            </div>
          </div>

          <nav className="topbar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`topbar-link ${
                  activeSection === item.key ? "topbar-link-active" : ""
                }`}
              >
                <img src={item.icon} alt="" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="topbar-status">
            <span className="topbar-status-dot" />
            <span>Servicio activo · 24 hs</span>
          </div>
        </div>
      </header>

      {/* MOBILE NAVBAR */}
      <nav className="mobile-navbar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`mobile-link ${
              activeSection === item.key ? "mobile-link-active" : ""
            }`}
          >
            <img src={item.icon} alt="" />
            <span>{item.label === "Reportar incidente" ? "Reportar" : item.label === "Mis incidentes" ? "Incidentes" : item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;