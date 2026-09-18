import {
  ShieldAlert,
  CalendarCheck,
  BarChart3,
  FileText,
} from "lucide-react";

import "../../styles/admin/Inicio_Admin.css";

type InicioAdminProps = {
  setActiveSection: (section: string) => void;
};

export default function Inicio_Admin({
  setActiveSection,
}: InicioAdminProps) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  return (
    <section className="admin-home">
      <header className="admin-home-header">
        <div>
          <span className="admin-home-tag">
            Municipalidad de Morón · Panel de Gestión
          </span>

          <h1>Bienvenido, {usuario.nombre || "Administrador"}</h1>

          <p>
            Gestión centralizada de reportes urbanos, cuadrillas, barrios y métricas de resolución con autorización basada en roles (JWT).
          </p>
        </div>
      </header>

      <div className="admin-grid">

        {/* GESTIONAR SERVICIOS Y CATEGORÍAS */}

        <article
          className="admin-card"
          onClick={() => setActiveSection("menu")}
        >
          <div className="admin-card-icon">
            <ShieldAlert size={42} />
          </div>

          <h3>Gestionar Servicios y Categorías</h3>

          <p>
            Administrá rubros de incidencias (baches, luminarias, basura, poda, semáforos) y cupos de cuadrillas de intervención.
          </p>
        </article>

        {/* ESTADÍSTICAS */}

        <article
          className="admin-card"
          onClick={() => setActiveSection("estadisticas")}
        >
          <div className="admin-card-icon">
            <BarChart3 size={42} />
          </div>

          <h3>Panel de Estadísticas y Reportes</h3>

          <p>
            Visualizá métricas por barrio, por categoría y tiempo promedio de resolución. Exportación a PDF y CSV.
          </p>
        </article>

        {/* INCIDENTES */}

        <article
          className="admin-card"
          onClick={() => setActiveSection("reservas")}
        >
          <div className="admin-card-icon">
            <CalendarCheck size={42} />
          </div>

          <h3>Gestionar Incidentes y Cuadrillas</h3>

          <p>
            Supervisá solicitudes recibidas, asigná estados (Pendiente, En revisión, En proceso, Resuelto) y filtrá por zona.
          </p>
        </article>

        {/* LOG DE AUDITORÍA */}

        <article
          className="admin-card"
          onClick={() => setActiveSection("auditoria")}
        >
          <div className="admin-card-icon">
            <FileText size={42} />
          </div>

          <h3>Log de Auditoría y Seguridad</h3>

          <p>
            Histórico inmutable de quién modificó el estado de qué reporte y cuándo (trazabilidad de seguridad para la entrega).
          </p>
        </article>

      </div>
    </section>
  );
}