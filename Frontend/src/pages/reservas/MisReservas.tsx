import "../../styles/reservas/MisReservas.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

interface Reserva {
  id: number;
  titulo: string;
  estado: string;
  nroOrden: number;
  hora?: string;
  fechaPedido?: string;
  tiempoEstimado: string;
}

function IconoIncidente() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1a1f36"
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
    <div className="mr-card">
      <div className="mr-card-info">
        <p className="mr-card-titulo">Incidente: {reserva.titulo || `Ticket #${reserva.nroOrden}`}</p>
        <p className="mr-card-dato">Estado: {reserva.estado}</p>
        <p className="mr-card-dato">Ticket N°: #{reserva.nroOrden}</p>
        <p className="mr-card-dato">
          Hora de reporte:{" "}
          {reserva.hora
            ? reserva.hora
            : reserva.fechaPedido
            ? new Date(reserva.fechaPedido).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Pendiente"}
        </p>
        <p className="mr-card-dato">
          Tiempo estimado: {reserva.tiempoEstimado || "24-48 hs"}
        </p>

        <div className="mr-card-acciones">
          <button className="mr-btn" onClick={() => onCancelar(reserva.id)}>
            Cancelar solicitud
          </button>

          <button
            className="mr-btn"
            onClick={() => navigate(`/detalles-pedido/${reserva.id}`)}
          >
            Ver detalles
          </button>
        </div>
      </div>

      <div className="mr-card-icono">
        <IconoIncidente />
      </div>
    </div>
  );
}

function MisReservas() {
  const [pedidos, setPedidos] = useState<Reserva[]>([]);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const idUsuario = JSON.parse(
          localStorage.getItem("usuario") || "{}",
        ).id;
        const response = await fetch(
          `${API_BASE_URL}/api/pedido/Usuario/${idUsuario}`,
        );
        if (!response.ok) throw new Error("Error al obtener incidentes");
        const data = await response.json();
        // Solo las activas
        setPedidos(
          data.filter(
            (p: Reserva) =>
              p.estado !== "Cancelado" && p.estado !== "Entregado",
          ),
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchReservas();
  }, []);

  const cancelarReserva = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: 5 }),
      });
      if (!response.ok) throw new Error("Error al cancelar");
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      alert("Solicitud de incidente cancelada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al cancelar la solicitud de incidente");
    }
  };

  return (
    <section className="mr-section">
      <div className="mr-header">
        <h2>Mis Incidentes</h2>
        <span className="mr-historial">Incidentes reportados</span>
      </div>
      <p className="mr-subtitulo">Aquí aparecerán tus incidentes y solicitudes activas en Morón.</p>
      <div className="mr-lista">
        {pedidos.map((reserva) => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            onCancelar={cancelarReserva}
          />
        ))}
      </div>
    </section>
  );
}

export default MisReservas;
