import { useEffect, useState } from "react";
import "../../styles/home/Home.css";
import { API_BASE_URL } from "../../config/api";
import MapaIncidente from "../../components/MapaIncidente";
import TimelineEstado from "../../components/TimelineEstado";

interface InicioProps {
  setActiveSection: (section: string) => void;
}

interface PedidoUsuario {
  id: number;
  nroOrden: number;
  titulo: string;
  descripcion: string;
  fechaPedido: string;
  estado: string; // "Pendiente", "Aceptado", "Preparando", "Listo", "Entregado", "Cancelado"
  tiempoEstimado: string;
  valor: number;
}

export default function Home({ setActiveSection }: InicioProps) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [pedidos, setPedidos] = useState<PedidoUsuario[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [apoyosMap, setApoyosMap] = useState<Record<number, number>>({ 101: 8, 102: 14, 103: 5 });
  const [apoyadoSet, setApoyadoSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    const cargarPedidosUsuario = async () => {
      const idUsuario = usuario.id || usuario.Id;
      if (!idUsuario) return;

      try {
        setCargandoPedidos(true);
        const response = await fetch(`${API_BASE_URL}/api/Pedido/Usuario/${idUsuario}`);

        if (!response.ok) {
          throw new Error("No se pudieron obtener las incidencias");
        }

        const data: PedidoUsuario[] = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error al cargar incidencias:", error);
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargarPedidosUsuario();
  }, [usuario.id, usuario.Id]);

  const manejarApoyo = (id: number) => {
    if (apoyadoSet.has(id)) {
      alert("Ya sumaste tu apoyo a este incidente.");
      return;
    }

    setApoyosMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));

    setApoyadoSet((prev) => new Set(prev).add(id));
    alert("¡Apoyo registrado! Gracias por ayudar a priorizar las incidencias de Morón.");
  };

  const incidentesPublicos = [
    {
      id: 101,
      lat: -34.6508,
      lng: -58.6214,
      titulo: "Bache profundo en Av. Rivadavia 14200",
      categoria: "Bache",
      barrio: "Morón Centro",
      estado: "En proceso",
      apoyos: apoyosMap[101] || 8,
    },
    {
      id: 102,
      lat: -34.6558,
      lng: -58.6284,
      titulo: "Luminaria apagada en Plaza San Martín",
      categoria: "Luminaria",
      barrio: "Morón Centro",
      estado: "Pendiente",
      apoyos: apoyosMap[102] || 14,
    },
    {
      id: 103,
      lat: -34.6468,
      lng: -58.6414,
      titulo: "Poda preventiva por ramas sobre cables",
      categoria: "Poda",
      barrio: "Castelar",
      estado: "En revisión",
      apoyos: apoyosMap[103] || 5,
    },
  ];

  const estadosActivos = ["Pendiente", "Aceptado", "Preparando", "Listo", "En revisión", "En proceso"];
  const pedidosActivos = pedidos.filter((p) => estadosActivos.includes(p.estado));
  const pedidoActivo = pedidosActivos.length > 0 ? pedidosActivos[0] : null;

  const pedidosResueltos = pedidos.filter((p) => p.estado === "Entregado" || p.estado === "Listo");

  const obtenerTextoReserva = () => {
    if (!pedidoActivo) return "No tenés ninguna incidencia en proceso en este momento.";
    switch (pedidoActivo.estado) {
      case "Pendiente":
        return "Tu reporte fue recibido y aguarda asignación del área correspondiente de Morón.";
      case "Aceptado":
      case "En revisión":
        return `Tu reporte fue asignado a la cuadrilla municipal. Tiempo estimado de intervención: ${pedidoActivo.tiempoEstimado || "24-48 hs"}.`;
      case "Preparando":
      case "En proceso":
        return `La cuadrilla se encuentra interviniendo en la zona. Tiempo estimado: ${pedidoActivo.tiempoEstimado || "en curso"}.`;
      case "Listo":
      case "Entregado":
        return "¡El incidente ha sido verificado y resuelto por el equipo técnico municipal!";
      default:
        return "";
    }
  };

  const generarNotificaciones = () => {
    const list: { icono: string; texto: string }[] = [];

    if (pedidoActivo) {
      if (pedidoActivo.estado === "Listo" || pedidoActivo.estado === "Entregado") {
        list.push({
          icono: "✅",
          texto: `¡Tu reporte #${pedidoActivo.nroOrden} fue resuelto exitosamente!`,
        });
      } else if (pedidoActivo.estado === "Preparando" || pedidoActivo.estado === "En proceso") {
        list.push({
          icono: "🛠️",
          texto: `Cuadrilla interviniendo en tu reporte #${pedidoActivo.nroOrden} (${pedidoActivo.tiempoEstimado || "en curso"}).`,
        });
      } else if (pedidoActivo.estado === "Aceptado" || pedidoActivo.estado === "En revisión") {
        list.push({
          icono: "📋",
          texto: `Reporte #${pedidoActivo.nroOrden} asignado a la cuadrilla técnica.`,
        });
      } else if (pedidoActivo.estado === "Pendiente") {
        list.push({
          icono: "⏳",
          texto: `Tu reporte #${pedidoActivo.nroOrden} ingresó y espera revisión municipal.`,
        });
      }
    }

    list.push({
      icono: "📧",
      texto: "Notificaciones automáticas por e-mail y en la app activas.",
    });

    list.push({
      icono: "🛡️",
      texto: "Atención y soporte de incidentes de Morón activo las 24 hs.",
    });

    return list.slice(0, 4);
  };

  const notificaciones = generarNotificaciones();

  return (
    <div className="home-page">
      <main className="home-content">
        <section className="home-header">
          <div>
            <h1 className="home-title">
              ¡Hola, {usuario.nombre || "Ciudadano"}! 👋
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
              Reportá baches, luminarias apagadas, acumulación de basura, semáforos fuera de servicio o poda de árboles con mapa interactivo y foto de evidencia.
            </p>

            <div className="home-main-footer">
              <span className="home-price">
                Respuesta estimativa: 24-48 hs
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

        {/* SECCIÓN MAPA INTERACTIVO Y APODOS / ESTO TAMBIÉN ME AFECTA */}
        <section style={{ marginTop: "24px", background: "#0f172a", borderRadius: "12px", padding: "20px", border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>🗺️ Mapa de Incidencias en Morón</h3>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                Revisá los reportes registrados en la zona y sumá tu apoyo si te afecta la misma incidencia.
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
            {incidentesPublicos.map((inc) => (
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
                    🤝 <strong>{inc.apoyos}</strong> vecinos afectados
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
                      cursor: apoyadoSet.has(inc.id) ? "default" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {apoyadoSet.has(inc.id) ? "✓ Sumaste tu apoyo" : "🙋 Esto también me afecta"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GRID DE ESTADÍSTICAS Y NOTIFICACIONES */}
        <section className="home-grid" style={{ marginTop: "24px" }}>
          <div className="home-card">
            <div className="home-card-header">
              <h3>{pedidoActivo ? `Incidente #${pedidoActivo.nroOrden}` : "Sin incidencias activas"}</h3>

              <span
                className="home-success-dot"
                style={{
                  backgroundColor: !pedidoActivo
                    ? "#94a3b8"
                    : pedidoActivo.estado === "Listo" || pedidoActivo.estado === "Entregado"
                    ? "#22c55e"
                    : "#f97316",
                }}
              />
            </div>

            <p className="home-card-text">
              {cargandoPedidos ? "Cargando datos de incidencias..." : obtenerTextoReserva()}
            </p>

            {pedidoActivo ? (
              <div className="home-qr">
                Ticket # {pedidoActivo.nroOrden}
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
                <h4>{pedidos.length}</h4>
                <p>Total</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
