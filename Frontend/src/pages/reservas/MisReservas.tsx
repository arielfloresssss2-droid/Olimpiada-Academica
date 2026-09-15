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

function IconoPlato() {
  return (
    <svg
      width="82"
      height="82"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plato exterior */}
      <circle cx="32" cy="32" r="18" stroke="#1a1f36" strokeWidth="2.4" />

      {/* Plato interior */}
      <circle
        cx="32"
        cy="32"
        r="11"
        stroke="#1a1f36"
        strokeWidth="1.6"
        opacity="0.9"
      />

      {/* Decoración comida */}
      <path
        d="M26 33C28 29 36 29 38 33"
        stroke="#1a1f36"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M27 37C30 35 34 35 37 37"
        stroke="#1a1f36"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Tenedor */}
      <line
        x1="8"
        y1="12"
        x2="8"
        y2="52"
        stroke="#1a1f36"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <line
        x1="4.5"
        y1="12"
        x2="4.5"
        y2="23"
        stroke="#1a1f36"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <line
        x1="8"
        y1="12"
        x2="8"
        y2="23"
        stroke="#1a1f36"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <line
        x1="11.5"
        y1="12"
        x2="11.5"
        y2="23"
        stroke="#1a1f36"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Cuchillo */}
      <path
        d="M56 12C53 18 53 28 56 34V52"
        stroke="#1a1f36"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
        <p className="mr-card-titulo">Reserva: {reserva.titulo}</p>
        <p className="mr-card-dato">Estado: {reserva.estado}</p>
        <p className="mr-card-dato">Nro de orden: {reserva.nroOrden}</p>
        <p className="mr-card-dato">
          Hora de la reserva:{" "}
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
          Tiempo estimado: {reserva.tiempoEstimado}
        </p>

        <div className="mr-card-acciones">
          <button className="mr-btn" onClick={() => onCancelar(reserva.id)}>
            Cancelar reserva
          </button>

          <button
            className="mr-btn"
            onClick={() => navigate(`/detalles-pedido/${reserva.id}`)}
          >
            Descripción
          </button>
        </div>
      </div>

      <div className="mr-card-icono">
        <IconoPlato />
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
        if (!response.ok) throw new Error("Error al obtener reservas");
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
      alert("Reserva cancelada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al cancelar la reserva");
    }
  };

  return (
    <section className="mr-section">
      <div className="mr-header">
        <h2>Mis Reservas</h2>
        <span className="mr-historial">Historial de pedidos</span>
      </div>
      <p className="mr-subtitulo">Aquí aparecerán tus reservas activas.</p>
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
