import {
  UtensilsCrossed,
  CalendarCheck,
  BarChart3,
} from "lucide-react";

import "../../styles/admin/Inicio_Admin.css";

type InicioAdminProps = {
  setActiveSection: (section: string) => void;
};

function Inicio_Admin({
  setActiveSection,
}: InicioAdminProps) {
  return (
    <section className="admin-home">
      <header className="admin-home-header">
        <div>
          <span className="admin-home-tag">
            Panel Administrativo
          </span>

          <h1>Bienvenido, Administrador</h1>

          <p>
            Gestioná usuarios, menús, reservas y estadísticas
            desde un único lugar.
          </p>
        </div>
      </header>

      <div className="admin-grid">

        {/* GESTIONAR MENÚ */}

        <article
          className="admin-card"
          onClick={() => setActiveSection("menu")}
        >
          <div className="admin-card-icon">
            <UtensilsCrossed size={42} />
          </div>

          <h3>Gestionar Menú y Productos</h3>

          <p>
            Creá, editá y actualizá los menús disponibles.
            Organizá comidas, precios y disponibilidad.
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

          <h3>Panel de Estadísticas</h3>

          <p>
            Visualizá métricas del sistema, reservas,
            asistencia y datos relevantes para la toma de
            decisiones.
          </p>
        </article>

        {/* RESERVAS */}

        <article
          className="admin-card"
          onClick={() => setActiveSection("reservas")}
        >
          <div className="admin-card-icon">
            <CalendarCheck size={42} />
          </div>

          <h3>Gestionar Reservas</h3>

          <p>
            Supervisá reservas activas, cancelaciones,
            historial y disponibilidad de cupos.
          </p>
        </article>

      </div>
    </section>
  );
}

export default Inicio_Admin;