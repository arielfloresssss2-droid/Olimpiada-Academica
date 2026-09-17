import { useNavigate } from "react-router-dom";
import "./Historial.css";

interface Pedido {
  id: number;
  titulo?: string;
  descripcion?: string;
  fechaPedido: string;
  estado: string;
  nroOrden?: number;
  valor?: number;
}

interface TarjetaHistorialProps {
  pedido: Pedido;
}

function TarjetaHistorial({ pedido }: TarjetaHistorialProps) {
  const navigate = useNavigate();

  const fechaObj = new Date(pedido.fechaPedido);
  const fechaValida = !isNaN(fechaObj.getTime());

  const fechaFormateada = fechaValida
    ? fechaObj.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : pedido.fechaPedido;

  const horaFormateada = fechaValida
    ? fechaObj.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " hs"
    : "Sin hora";

  const esCancelado = pedido.estado.toLowerCase().includes("cancelado");

  return (
    <div className="tarjeta-historial">
      <div className="tarjeta-historial-header">
        <span className="th-titulo">
          {pedido.titulo || pedido.descripcion || `Incidente #${pedido.nroOrden || pedido.id}`}
        </span>
        <span className={`th-estado-badge ${esCancelado ? "badge-cancelado" : "badge-entregado"}`}>
          {pedido.estado === "Entregado" ? "Resuelto" : pedido.estado}
        </span>
      </div>

      <div className="tarjeta-historial-body">
        <div className="th-info-row">
          <span className="th-label">📅 Fecha:</span>
          <span className="th-value">{fechaFormateada}</span>
        </div>

        <div className="th-info-row">
          <span className="th-label">⏰ Hora:</span>
          <span className="th-value">{horaFormateada}</span>
        </div>

        <div className="th-info-row">
          <span className="th-label">🔢 Ticket:</span>
          <span className="th-value">#{pedido.nroOrden || pedido.id}</span>
        </div>
      </div>

      <button
        type="button"
        className="btn-detalles"
        onClick={() => navigate(`/detalles-pedido/${pedido.id}`)}
      >
        Ver detalles
      </button>
    </div>
  );
}

export default TarjetaHistorial;