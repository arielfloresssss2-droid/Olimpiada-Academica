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

interface ReporteDetalle {
  id: number;
  idUser: number;
  titulo: string;
  descripcion?: string;
  estado: string;
  prioridad?: string;
  hora?: string;
  fechaCreacion: string;
  apoyosCount?: number;
  direccion?: {
    id: number;
    direccionTexto: string;
    latitud?: number;
    longitud?: number;
  } | null;
  usuario?: {
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  incidente?: {
    nombre: string;
  } | null;
}

export default function DetallesPedido() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [reporte, setReporte] = useState<ReporteDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReporte = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/Reportes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la información del incidente");
        }
        const data = await response.json();
        setReporte(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al obtener el incidente");
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      fetchReporte();
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

  if (error || !reporte) {
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

  const fechaObj = reporte.fechaCreacion ? new Date(reporte.fechaCreacion) : null;
  const fechaValida = fechaObj && !isNaN(fechaObj.getTime());

  const fechaFormateada = fechaValida
    ? fechaObj.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Reciente";

  const horaFormateada = reporte.hora || (fechaValida
    ? fechaObj.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " hs"
    : "Pendiente");

  const latNum = reporte.direccion?.latitud ? Number(reporte.direccion.latitud) : -34.6508;
  const lngNum = reporte.direccion?.longitud ? Number(reporte.direccion.longitud) : -58.6214;

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
        <h1 className="dp-orden">Ticket #{reporte.id}</h1>

        {/* TIMELINE VISUAL DEL ESTADO */}
        <TimelineEstado estadoActual={reporte.estado} />

        <div className="dp-info">
          <div className="dp-info-item">
            <Hash size={24} />
            <div>
              <strong>Número de ticket</strong>
              <span>#{reporte.id}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Package size={24} />
            <div>
              <strong>Estado</strong>
              <span>{reporte.estado}</span>
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
              <strong>Prioridad</strong>
              <span>{reporte.prioridad || "Media"}</span>
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
          <h4>Título e Incidencia</h4>
          <p style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", border: "1px solid #1e293b", color: "#f8fafc", fontWeight: 600 }}>
            {reporte.titulo} {reporte.incidente?.nombre ? `(${reporte.incidente.nombre})` : ""}
          </p>
        </div>

        {reporte.descripcion && (
          <div className="dp-bloque" style={{ marginTop: "16px" }}>
            <h4>Descripción del Reporte</h4>
            <p style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", border: "1px solid #1e293b", color: "#cbd5e1" }}>
              {reporte.descripcion}
            </p>
          </div>
        )}

        <div className="dp-separador"></div>

        {/* MAPA INTERACTIVO DE UBICACIÓN */}
        <div className="dp-bloque">
          <h4>Ubicación Georreferenciada: {reporte.direccion?.direccionTexto || "Morón"}</h4>
          <MapaIncidente
            latSeleccionada={latNum}
            lngSeleccionada={lngNum}
            readOnly={true}
            height="280px"
          />
        </div>
      </div>
    </section>
  );
}
