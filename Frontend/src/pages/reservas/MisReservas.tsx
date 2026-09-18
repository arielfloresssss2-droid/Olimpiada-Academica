import "../../styles/reservas/MisReservas.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import TimelineEstado from "../../components/TimelineEstado";

interface Reserva {
  id: number;
  titulo: string;
  estado: string;
  nroOrden: number;
  hora?: string;
  fechaPedido?: string;
  tiempoEstimado: string;
  descripcion?: string;
}

function IconoIncidente() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#38bdf8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ReservaCard({
  reserva,
  onCancelar,
}: {
  reserva: Reserva;
  onCancelar: (id: number) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="mr-card" style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
      <div className="mr-card-info" style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 8px", color: "#f8fafc", fontSize: "16px" }}>
          Incidencia: {reserva.titulo || `Ticket #${reserva.nroOrden}`}
        </h3>
        
        <p className="mr-card-dato" style={{ color: "#94a3b8", margin: "4px 0" }}>
          Ticket N°: <strong style={{ color: "#38bdf8" }}>#{reserva.nroOrden}</strong>
        </p>

        <p className="mr-card-dato" style={{ color: "#94a3b8", margin: "4px 0" }}>
          Fecha de reporte:{" "}
          {reserva.fechaPedido
            ? new Date(reserva.fechaPedido).toLocaleDateString("es-AR")
            : "Reciente"}
        </p>

        {/* TIMELINE VISUAL DEL ESTADO */}
        <TimelineEstado estadoActual={reserva.estado} />

        <div className="mr-card-acciones" style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
          <button
            className="mr-btn"
            onClick={() => onCancelar(reserva.id)}
            style={{ background: "#334155", color: "#f8fafc", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
          >
            Cancelar reporte
          </button>

          <button
            className="mr-btn"
            onClick={() => navigate(`/detalles-pedido/${reserva.id}`)}
            style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Ver detalles completos ➔
          </button>
        </div>
      </div>

      <div className="mr-card-icono" style={{ marginLeft: "20px" }}>
        <IconoIncidente />
      </div>
    </div>
  );
}

export default function MisReservas() {
  const [pedidos, setPedidos] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setCargando(true);
        const idUsuario = JSON.parse(
          localStorage.getItem("usuario") || "{}",
        ).id;
        const response = await fetch(
          `${API_BASE_URL}/api/Pedido/Usuario/${idUsuario}`,
        );
        if (!response.ok) throw new Error("Error al obtener incidentes");
        const data = await response.json();
        setPedidos(
          data.filter(
            (p: Reserva) =>
              p.estado !== "Cancelado" && p.estado !== "Entregado",
          ),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    fetchReservas();
  }, []);

  const cancelarReserva = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: 5 }),
      });
      if (!response.ok) throw new Error("Error al cancelar");
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      alert("Reporte de incidencia cancelado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al cancelar el reporte de incidencia");
    }
  };

  return (
    <section className="mr-section">
      <div className="mr-header">
        <h2>📋 Mis Incidentes y Reportes Activos</h2>
        <span className="mr-historial">Seguimiento Morón</span>
      </div>
      <p className="mr-subtitulo" style={{ color: "#94a3b8" }}>
        Aquí podés consultar el avance en tiempo real de tus incidencias enviadas a la Municipalidad de Morón.
      </p>

      {cargando ? (
        <p style={{ color: "#94a3b8", padding: "20px" }}>Cargando tus incidentes...</p>
      ) : pedidos.length === 0 ? (
        <div style={{ background: "#0f172a", borderRadius: "12px", padding: "30px", border: "1px solid #1e293b", textAlign: "center" }}>
          <p style={{ color: "#f8fafc", fontSize: "16px", margin: "0 0 8px" }}>No tenés incidentes o reportes en curso actualmente.</p>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>Si tenés un problema en tu barrio, podés reportarlo en cualquier momento.</p>
        </div>
      ) : (
        <div className="mr-lista">
          {pedidos.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              onCancelar={cancelarReserva}
            />
          ))}
        </div>
      )}
    </section>
  );
}
