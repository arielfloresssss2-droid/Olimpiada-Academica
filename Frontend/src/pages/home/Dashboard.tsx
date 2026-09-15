import { useState } from "react";

import Sidebar from "../Sidebar";

import Inicio from "./Inicio";
import Reservas from "../reservas/Reservas";
import MisReservas from "../reservas/MisReservas";
import Historial from "../perfil/Historial";
import Perfil from "../perfil/Perfil";
import Soporte from "../soporte/Soporte";
import ConfirmarPedido from "../reservas/ConfirmarPedido";


import "../../styles/home/Dashboard.css";

function Dashboard() {
  const [activeSection, setActiveSection] = useState("inicio");

  const renderSection = () => {
    switch (activeSection) {
      case "inicio":
        return <Inicio setActiveSection={setActiveSection} />;

      case "reservar":
        return <Reservas setActiveSection={setActiveSection} />;

      case "reservas":
        return <MisReservas />;

      case "historial":
        return <Historial />;

      case "perfil":
        return <Perfil />;

      case "support":
            return <Soporte />;

      case "confirmar-pedido":
        return <ConfirmarPedido setActiveSection={setActiveSection} />;


      default:
        return <Inicio setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* CONTENT */}

      <main className="dashboard-content">{renderSection()}</main>
    </div>
  );
}

export default Dashboard;
