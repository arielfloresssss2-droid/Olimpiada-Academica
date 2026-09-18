import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Hash,
  Package,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import "../../styles/reservas/DetallesPedido.css";
import { API_BASE_URL } from "../../config/api";
import TimelineEstado from "../../components/TimelineEstado";
import MapaIncidente from "../../components/MapaIncidente";

interface ProductoDetalle {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface PedidoDetalle {
  id: number;
  nroOrden: number;
  estado: string;
  fechaPedido: string;
  tiempoEstimado: string;
  metodoPago: string | number;
  valor: number;
  titulo: string;
  descripcion?: string;
  productos: ProductoDetalle[];
}

export default function DetallesPedido() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        setCargando(true);
        const response = await fetch(`${API_BASE_URL}/api/Pedido/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar la información del incidente");
        }
        const data = await response.json();
        setPedido(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al obtener el incidente");
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      fetchPedido();
    }
  }, [id]);

  if (cargando) {
    return (
      <section className="dp-section">
        <header className="dp-header">
          <button className="dp-volver" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2>Detalles del incidente</h2>
            <p>Cargando información...</p>
          </div>
        </header>
        <div className="dp-card">
          <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            Cargando detalles del reporte...
          </p>
        </div>
      </section>
    );
  }

  if (error || !pedido) {
    return (
      <section className="dp-section">
        <header className="dp-header">
          <button className="dp-volver" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2>Detalles del incidente</h2>
            <p>Error</p>
          </div>
        </header>
        <div className="dp-card">
          <p style={{ textAlign: "center", padding: "2rem", color: "#f87171" }}>
            {error || "No se encontró el reporte solicitado."}
          </p>
        </div>
      </section>
    );
  }

  const fechaObj = pedido.fechaPedido ? new Date(pedido.fechaPedido) : null;
  const fechaValida = fechaObj && !isNaN(fechaObj.getTime());

  const fechaFormateada = fechaValida
    ? fechaObj.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Reciente";

  const horaFormateada = fechaValida
    ? fechaObj.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " hs"
    : "Pendiente";

  const descripcionTexto =
    pedido.descripcion ||
    pedido.titulo ||
    (pedido.productos && pedido.productos.length > 0
      ? pedido.productos.map((p) => p.nombre).join(", ")
      : "Reporte de incidencia urbana municipal");

  return (
    <section className="dp-section">
      <header className="dp-header">
        <button className="dp-volver" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>

        <div>
          <h2>Detalles de la Incidencia</h2>
          <p>Información completa, estado y mapa de ubicación</p>
        </div>
      </header>

      <div className="dp-card">
        <h1 className="dp-orden">Ticket #{pedido.nroOrden || pedido.id}</h1>

        {/* TIMELINE VISUAL DEL ESTADO */}
        <TimelineEstado estadoActual={pedido.estado} />

        <div className="dp-info">
          <div className="dp-info-item">
            <Hash size={24} />
            <div>
              <strong>Número de ticket</strong>
              <span>#{pedido.nroOrden || pedido.id}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Package size={24} />
            <div>
              <strong>Estado</strong>
              <span>{pedido.estado}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Calendar size={24} />
            <div>
              <strong>Fecha de reporte</strong>
              <span>{fechaFormateada}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Clock3 size={24} />
            <div>
              <strong>Hora</strong>
              <span>{horaFormateada}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Clock3 size={24} />
            <div>
              <strong>Tiempo estimado</strong>
              <span>{pedido.tiempoEstimado || "24-48 hs"}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Package size={24} />
            <div>
              <strong>Notificaciones</strong>
              <span>Mail & App Activas</span>
            </div>
          </div>
        </div>

        <div className="dp-separador"></div>

        <div className="dp-bloque">
          <h4>Descripción y Detalles del Reporte</h4>
          <p style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", border: "1px solid #1e293b", color: "#f8fafc" }}>
            {descripcionTexto}
          </p>
        </div>

        <div className="dp-separador"></div>

        {/* MAPA INTERACTIVO DE UBICACIÓN */}
        <div className="dp-bloque">
          <h4>Ubicación Georreferenciada del Incidente</h4>
          <MapaIncidente
            latSeleccionada={-34.6508}
            lngSeleccionada={-58.6214}
            readOnly={true}
            height="280px"
          />
        </div>
      </div>
    </section>
  );
}
