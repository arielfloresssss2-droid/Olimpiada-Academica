import { useEffect, useState } from "react";
import "../../styles/home/Home.css";
import { API_BASE_URL } from "../../config/api";
import MapaIncidente from "../../components/MapaIncidente";
import TimelineEstado from "../../components/TimelineEstado";

interface InicioProps {
  setActiveSection: (section: string) => void;
}

interface ReporteActivo {
  id: number;
  nroOrden: number;
  titulo: string;
  descripcion: string;
  fechaPedido: string;
  estado: string;
  tiempoEstimado: string;
  prioridad?: string;
}

interface IncidenteMapa {
  id: number;
  lat: number;
  lng: number;
  titulo: string;
  categoria: string;
  barrio: string;
  estado: string;
  apoyos: number;
}

export default function Home({ setActiveSection }: InicioProps) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token") || "";

  const [pedidos, setPedidos] = useState<ReporteActivo[]>([]);
  const [incidentesPublicos, setIncidentesPublicos] = useState<IncidenteMapa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [apoyadoSet, setApoyadoSet] = useState<Set<number>>(new Set());

  // 1. Cargar incidentes creados por el usuario logueado
  useEffect(() => {
    const cargarIncidentesUsuario = async () => {
      const idUsuario = usuario.id || usuario.Id;
      if (!idUsuario) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/Reportes/usuario/${idUsuario}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setPedidos(data);
        }
      } catch (error) {
        console.error("Error al cargar incidentes del usuario:", error);
      }
    };

    cargarIncidentesUsuario();
  }, [usuario.id, usuario.Id, token]);

  // 2. Cargar reportes públicos reales de la base de datos para el mapa
  const cargarReportesPublicos = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_BASE_URL}/api/Reportes`);
      if (response.ok) {
        const data = await response.json();

        const mapeados: IncidenteMapa[] = data
          .filter((r: any) => r.direccion && r.direccion.latitud && r.direccion.longitud)
          .map((r: any) => ({
            id: r.id,
            lat: Number(r.direccion.latitud),
            lng: Number(r.direccion.longitud),
            titulo: r.titulo,
            categoria: r.incidente?.nombre || "Vía Pública",
            barrio: r.direccion.direccionTexto || "Morón",
            estado: r.estado || "Pendiente",
            apoyos: r.apoyosCount || 0,
          }));

        setIncidentesPublicos(mapeados);
      }
    } catch (error) {
      console.error("Error al cargar reportes para el mapa:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportesPublicos();
  }, []);

  // 3. Manejo de apoyo con llamada real a POST /api/Reportes/{id}/apoyo
  const manejarApoyo = async (id: number) => {
    if (!token) {
      alert("Iniciá sesión para sumar tu apoyo a este reclamo.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Reportes/${id}/apoyo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar el apoyo.");
      }

      const data = await response.json();
      
      setIncidentesPublicos((prev) =>
        prev.map((inc) =>
          inc.id === id ? { ...inc, apoyos: data.totalApoyos } : inc
        )
      );

      if (data.apoyadoPorMi) {
        setApoyadoSet((prev) => new Set(prev).add(id));
      } else {
        setApoyadoSet((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }

      alert(data.mensaje);
    } catch (error) {
      console.error(error);
      alert("Error al procesar el apoyo.");
    }
  };

  const estadosActivos = ["Pendiente", "Aceptado", "En revisión", "En proceso"];
  const pedidosActivos = pedidos.filter((p) => estadosActivos.includes(p.estado));
  const pedidoActivo = pedidosActivos.length > 0 ? pedidosActivos[0] : null;
  const pedidosResueltos = pedidos.filter((p) => p.estado === "Resuelto" || p.estado === "Listo");

  const obtenerTextoIncidente = () => {
    if (!pedidoActivo) return "No tenés ninguna incidencia en proceso en este momento.";
    switch (pedidoActivo.estado) {
      case "Pendiente":
        return "Tu reporte fue recibido y aguarda asignación de cuadrilla de Morón.";
      case "En revisión":
      case "Aceptado":
        return "Tu reporte fue verificado y asignado al equipo técnico para su inspección.";
      case "En proceso":
        return "La cuadrilla municipal se encuentra interviniendo activamente en la zona.";
      case "Resuelto":
        return "¡El incidente fue reparado y verificado por el área de Atención Ciudadana!";
      default:
        return `Estado actual: ${pedidoActivo.estado}.`;
    }
  };

  const notificaciones = [
    {
      icono: "🛡️",
      texto: "Atención y soporte de incidencias de Morón activo las 24 hs.",
    },
    {
      icono: "🤖",
      texto: "Moderación inteligente activa: detección de duplicados a menos de 50 metros.",
    },
    {
      icono: "⚡",
      texto: "Escalado automático: a partir de 5 apoyos vecinales sube la prioridad del reporte.",
    },
    {
      icono: "📧",
      texto: "Notificaciones por correo electrónico al actualizarse el estado de tu reporte.",
    },
  ];

  return (
    <div className="home-page">
      <main className="home-content">
        <section className="home-header">
          <div>
            <h1 className="home-title">
              ¡Hola, {usuario.nombre || "Vecino/a"}! 👋
            </h1>

            <p className="home-subtitle">
              Plataforma oficial de reporte y seguimiento de incidencias de la Municipalidad de Morón.
            </p>
          </div>
        </section>

        {/* TARJETA PRINCIPAL DE ACCIÓN */}
        <section className="home-main-card">
          <div className="home-main-info">
            <span className="home-badge">ATENCIÓN CIUDADANA MORÓN</span>

            <h2>Centro de Reportes e Incidencias Urbanas</h2>

            <p>
              Reportá baches, luminarias apagadas, acumulación de residuos, semáforos fuera de servicio o poda de árboles con mapa interactivo y foto de evidencia.
            </p>

            <div className="home-main-footer">
              <span className="home-price">
                Respuesta estimada: 24-48 hs
              </span>

              <button
                className="home-main-btn"
                onClick={() => setActiveSection("reservar")}
              >
                ➕ Reportar incidencia
              </button>
            </div>
          </div>

          <div className="home-main-image">
            <img
              src="/support.svg"
              width="180"
              height="140"
              alt="Atención de incidentes Morón"
            />
          </div>
        </section>

        {/* TIMELINE SI HAY INCIDENTE ACTIVO */}
        {pedidoActivo && (
          <section style={{ marginTop: "24px" }}>
            <TimelineEstado estadoActual={pedidoActivo.estado} />
          </section>
        )}

        {/* SECCIÓN MAPA INTERACTIVO CON DATOS REALES */}
        <section style={{ marginTop: "24px", background: "#0f172a", borderRadius: "12px", padding: "20px", border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>🗺️ Mapa de Incidencias en Morón</h3>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                Revisá los reportes registrados en la zona y sumá tu apoyo para aumentar la prioridad del reclamo.
              </p>
            </div>

            <button
              onClick={() => setActiveSection("reservar")}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📍 Marcar nueva incidencia en mapa
            </button>
          </div>

          <MapaIncidente
            incidentesExistentes={incidentesPublicos}
            readOnly={true}
            height="340px"
          />

          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
            {cargando ? (
              <p style={{ color: "#94a3b8" }}>Cargando incidencias del municipio...</p>
            ) : incidentesPublicos.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No hay incidencias reportadas en el mapa actualmente.</p>
            ) : (
              incidentesPublicos.slice(0, 6).map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    background: "#1e293b",
                    borderRadius: "8px",
                    padding: "14px",
                    border: "1px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600 }}>📍 {inc.barrio}</span>
                      <span style={{ fontSize: "11px", background: "#334155", color: "#cbd5e1", padding: "2px 8px", borderRadius: "12px" }}>
                        {inc.estado}
                      </span>
                    </div>
                    <h4 style={{ margin: "8px 0 4px", color: "#f8fafc", fontSize: "14px" }}>{inc.titulo}</h4>
                  </div>

                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      🤝 <strong>{inc.apoyos}</strong> vecinos
                    </span>

                    <button
                      onClick={() => manejarApoyo(inc.id)}
                      style={{
                        background: apoyadoSet.has(inc.id) ? "#334155" : "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {apoyadoSet.has(inc.id) ? "✓ Apoyado" : "🙋 Me afecta"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* GRID DE ESTADÍSTICAS Y NOTIFICACIONES */}
        <section className="home-grid" style={{ marginTop: "24px" }}>
          <div className="home-card">
            <div className="home-card-header">
              <h3>{pedidoActivo ? `Incidente #${pedidoActivo.nroOrden || pedidoActivo.id}` : "Sin incidencias activas"}</h3>

              <span
                className="home-success-dot"
                style={{
                  backgroundColor: !pedidoActivo
                    ? "#94a3b8"
                    : pedidoActivo.estado === "Resuelto"
                    ? "#22c55e"
                    : "#f97316",
                }}
              />
            </div>

            <p className="home-card-text">
              {obtenerTextoIncidente()}
            </p>

            {pedidoActivo ? (
              <div className="home-qr">
                Ticket # {pedidoActivo.nroOrden || pedidoActivo.id}
              </div>
            ) : (
              <button
                className="home-shortcut-btn w-full"
                onClick={() => setActiveSection("reservar")}
              >
                Reportar una incidencia ahora
              </button>
            )}
          </div>

          <div className="home-card">
            <h3 className="home-card-title">
              🔔 Notificaciones e Informes
            </h3>

            <div className="home-notifications">
              {notificaciones.map((n, idx) => (
                <div className="home-notification" key={idx}>
                  <span>{n.icono}</span>
                  <p>{n.texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="home-card home-card-stats">
            <h3 className="home-card-title">
              📊 Estadísticas de Morón
            </h3>

            <div className="home-stats">
              <div className="home-stat-box">
                <h4>{pedidosResueltos.length}</h4>
                <p>Resueltas</p>
              </div>

              <div className="home-stat-box">
                <h4>{pedidosActivos.length}</h4>
                <p>En curso</p>
              </div>

              <div className="home-stat-box">
                <h4>{incidentesPublicos.length}</h4>
                <p>En Mapa</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
