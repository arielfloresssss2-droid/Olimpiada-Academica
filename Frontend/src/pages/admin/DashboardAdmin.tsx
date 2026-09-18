import { useState } from "react";

import SidebarAdmin from "../SidebarAdmin";

import Inicio_Admin from "./Inicio_Admin";
import GestionarMenu from "./GestionarMenu";
import Estadisticas from "./Estadisticas";
import GestionarReservas_Admin from "./GestionarReservas_Admin";

import Perfil from "../perfil/Perfil";
import LogAuditoria from "../../components/LogAuditoria";

import "../../styles/home/Dashboard.css";

function DashboardAdmin() {
  const [activeSection, setActiveSection] = useState("inicio");

  const renderSection = () => {
    switch (activeSection) {
      case "inicio":
        return (
          <Inicio_Admin
            setActiveSection={setActiveSection}
          />
        );

      case "menu":
        return <GestionarMenu />;

      case "estadisticas":
        return <Estadisticas />;

      case "reservas":
        return <GestionarReservas_Admin />;

      case "auditoria":
        return <LogAuditoria />;

      case "perfil":
        return <Perfil />;

      default:
        return (
          <Inicio_Admin
            setActiveSection={setActiveSection}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR ADMIN */}

      <SidebarAdmin
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* CONTENT */}

      <main className="dashboard-content">
        {renderSection()}
      </main>
    </div>
  );
}

export default DashboardAdmin;