import { useEffect, useRef, useState } from "react";
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
  // Referencias para medir posición y ancho exacto en Desktop y Mobile
  const itemsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const mobileItemsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [desktopIndicator, setDesktopIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const [mobileIndicator, setMobileIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    const updateIndicators = () => {
      // Calcular píldora en Desktop
      const activeDesktop = itemsRef.current[activeSection];
      if (activeDesktop) {
        setDesktopIndicator({
          left: activeDesktop.offsetLeft,
          top: activeDesktop.offsetTop,
          width: activeDesktop.offsetWidth,
          height: activeDesktop.offsetHeight,
          opacity: 1,
        });
      }

      // Calcular píldora en Mobile
      const activeMobile = mobileItemsRef.current[activeSection];
      if (activeMobile) {
        setMobileIndicator({
          left: activeMobile.offsetLeft,
          top: activeMobile.offsetTop,
          width: activeMobile.offsetWidth,
          height: activeMobile.offsetHeight,
          opacity: 1,
        });
      }
    };

    updateIndicators();
    const rafId = requestAnimationFrame(updateIndicators);
    window.addEventListener("resize", updateIndicators);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateIndicators);
    };
  }, [activeSection]);

  return (
    <>
      {/* TOPBAR (desktop/tablet) - Con animación fluida */}
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
            {/* Píldora blanca deslizante animada en Desktop */}
            <div
              className="topbar-indicator"
              style={{
                left: `${desktopIndicator.left}px`,
                top: `${desktopIndicator.top}px`,
                width: `${desktopIndicator.width}px`,
                height: `${desktopIndicator.height}px`,
                opacity: desktopIndicator.opacity,
              }}
            />

            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                ref={(el) => {
                  itemsRef.current[item.key] = el;
                }}
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

      {/* MOBILE NAVBAR - Fija abajo y con animación fluida idéntica */}
      <nav className="mobile-navbar">
        {/* Píldora blanca deslizante animada en Mobile */}
        <div
          className="mobile-indicator"
          style={{
            left: `${mobileIndicator.left}px`,
            top: `${mobileIndicator.top}px`,
            width: `${mobileIndicator.width}px`,
            height: `${mobileIndicator.height}px`,
            opacity: mobileIndicator.opacity,
          }}
        />

        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            ref={(el) => {
              mobileItemsRef.current[item.key] = el;
            }}
            onClick={() => setActiveSection(item.key)}
            className={`mobile-link ${
              activeSection === item.key ? "mobile-link-active" : ""
            }`}
          >
            <img src={item.icon} alt="" />
            <span>
              {item.label === "Reportar incidente"
                ? "Reportar"
                : item.label === "Mis incidentes"
                ? "Incidentes"
                : item.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;