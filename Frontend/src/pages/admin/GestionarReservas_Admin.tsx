import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  CheckCheck,
  User,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import LogAuditoria, { type LogEntry } from "../../components/LogAuditoria";

export type EstadoReserva =
  | "Pendiente"
  | "En revisión"
  | "En proceso"
  | "Resuelto"
  | "Rechazado"
  | "Cancelado";

interface ReporteApi {
  id: number;
  idUser: number;
  usuario: { id: number; nombre: string; apellido: string; email: string } | null;
  estado: string;
  incidente: { id: number; nombre: string; descripcion?: string } | null;
  titulo: string;
  descripcion: string;
  prioridad: string;
  fechaCreacion: string;
  direccion: { id: number; direccionTexto: string; latitud?: number; longitud?: number } | null;
  apoyosCount: number;
}

interface ReservaItem {
  id: string;
  nroOrden: number;
  usuario: string;
  email: string;
  fecha: string;
  hora: string;
  titulo: string;
  descripcion: string;
  barrio: string;
  estado: string;
  prioridad: string;
  apoyos: number;
  raw: ReporteApi;
}

interface FiltrosReservas {
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
  usuario: string;
  barrio: string;
}

const PAGE_SIZE = 8;

export default function GestionarReservas_Admin() {
  const [reportes, setReportes] = useState<ReservaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logsAuditoria, setLogsAuditoria] = useState<LogEntry[]>([]);

  const [filtros, setFiltros] = useState<FiltrosReservas>({
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
    usuario: "",
    barrio: "",
  });

  const [pagina, setPagina] = useState(1);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReservaItem | null>(null);

  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rolActual = usuarioActual.rol || "Administrador Municipal";
  const token = localStorage.getItem("token") || "";

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/Reportes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("No se pudieron obtener las incidencias.");
      }

      const data: ReporteApi[] = await response.json();

      const items: ReservaItem[] = data.map((r) => {
        const fechaObj = new Date(r.fechaCreacion);
        return {
          id: r.id.toString(),
          nroOrden: r.id,
          usuario: r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : `Vecino #${r.idUser}`,
          email: r.usuario?.email || "Sin email",
          fecha: fechaObj.toLocaleDateString("es-AR"),
          hora: fechaObj.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
          titulo: r.titulo,
          descripcion: r.descripcion || "Sin detalle adicional",
          barrio: r.direccion?.direccionTexto || "Morón",
          estado: r.estado || "Pendiente",
          prioridad: r.prioridad || "Media",
          apoyos: r.apoyosCount || 0,
          raw: r,
        };
      });

      setReportes(items);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las incidencias desde la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      const fechaReporte = new Date(r.raw.fechaCreacion);

      const fechaDesde = filtros.fechaDesde ? new Date(`${filtros.fechaDesde}T00:00:00`) : null;
      const fechaHasta = filtros.fechaHasta ? new Date(`${filtros.fechaHasta}T23:59:59`) : null;

      const coincideFechaDesde = !fechaDesde || fechaReporte >= fechaDesde;
      const coincideFechaHasta = !fechaHasta || fechaReporte <= fechaHasta;
      const coincideEstado = !filtros.estado || r.estado.toLowerCase() === filtros.estado.toLowerCase();

      const usuarioBusqueda = filtros.usuario.toLowerCase().trim();
      const coincideUsuario =
        !usuarioBusqueda ||
        r.usuario.toLowerCase().includes(usuarioBusqueda) ||
        r.email.toLowerCase().includes(usuarioBusqueda);

      const coincideBarrio =
        !filtros.barrio ||
        r.barrio.toLowerCase().includes(filtros.barrio.toLowerCase());

      return (
        coincideFechaDesde &&
        coincideFechaHasta &&
        coincideEstado &&
        coincideUsuario &&
        coincideBarrio
      );
    });
  }, [reportes, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(reportesFiltrados.length / PAGE_SIZE));
  const reportesPagina = reportesFiltrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const total = reportes.length;
  const pendientes = reportes.filter((r) => r.estado.toLowerCase() === "pendiente").length;
  const enRevision = reportes.filter((r) => r.estado.toLowerCase() === "en revisión" || r.estado.toLowerCase() === "aceptado").length;
  const enProceso = reportes.filter((r) => r.estado.toLowerCase() === "en proceso").length;
  const resueltos = reportes.filter((r) => r.estado.toLowerCase() === "resuelto").length;
  const rechazados = reportes.filter((r) => r.estado.toLowerCase() === "rechazado" || r.estado.toLowerCase() === "cancelado").length;

  const cambiarEstado = async (id: string, nuevoEstado: EstadoReserva) => {
    try {
      const repActual = reportes.find((r) => r.id === id);
      const estadoAnterior = repActual ? repActual.estado : "Pendiente";

      const response = await fetch(`${API_BASE_URL}/api/Reportes/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nuevoEstado: nuevoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del reporte.");
      }

      // REGISTRAR EN LOG DE AUDITORÍA
      const nuevoLog: LogEntry = {
        id: Date.now(),
        reporteId: Number(id),
        tituloReporte: repActual?.titulo || `Incidencia #${id}`,
        usuarioResponsable: `${usuarioActual.nombre || "Admin"} (${rolActual})`,
        rolUsuario: rolActual,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        fechaHora: new Date().toLocaleString("es-AR"),
        detalles: `Cambio de estado autorizado mediante JWT para el reporte #${id}`,
      };

      setLogsAuditoria((prev) => [nuevoLog, ...prev]);

      await cargarReportes();
      alert(`Estado del reporte #${id} actualizado a "${nuevoEstado}". Se envió notificación al ciudadano y se registró en auditoría.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "No se pudo actualizar el estado.");
    }
  };

  const exportarCSV = () => {
    const encabezados = "ID,Ticket,Ciudadano,Email,Fecha,Incidencia,Prioridad,Estado,Apoyos\n";
    const filas = reportesFiltrados
      .map(
        (r) =>
          `"${r.id}","${r.nroOrden}","${r.usuario}","${r.email}","${r.fecha}","${r.titulo.replace(/"/g, '""')}","${r.prioridad}","${r.estado}","${r.apoyos}"`
      )
      .join("\n");

    const blob = new Blob([encabezados + filas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Reportes_Incidentes_Moron.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    alert("📑 Imprimiendo reporte consolidado de incidencias de Morón...");
    window.print();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      estado: "",
      usuario: "",
      barrio: "",
    });
    setPagina(1);
  };

  const actualizarFiltro = (campo: keyof FiltrosReservas, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    setPagina(1);
  };

  return (
    <div className="gr-page">
      <div className="gr-header">
        <div>
          <span className="gr-tag" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} /> AUTORIZACIÓN JWT: {rolActual.toUpperCase()}
          </span>

          <h1 className="gr-title">Gestión de Reportes e Incidencias Urbanas</h1>

          <p className="gr-subtitle">
            Administración centralizada de reportes ciudadanos, asignación a cuadrillas y trazabilidad inmutable de seguridad.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={exportarCSV} className="gr-btn-update" style={{ background: "#10b981", color: "white" }}>
            <FileSpreadsheet size={16} /> Exportar CSV
          </button>
          <button onClick={exportarPDF} className="gr-btn-update" style={{ background: "#ef4444", color: "white" }}>
            <FileText size={16} /> Imprimir / PDF
          </button>
          <button onClick={cargarReportes} className="gr-btn-update">
            <RotateCcw size={16} /> Actualizar
          </button>
        </div>
      </div>

      {error && <div className="gr-error">{error}</div>}

      {/* TARJETAS DE ESTADÍSTICAS RÁPIDAS */}
      <div className="gr-stats">
        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--red">
            <CalendarDays size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Total</span>
            <p className="gr-stat-value">{total}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--orange">
            <Clock size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Pendientes</span>
            <p className="gr-stat-value">{pendientes}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--green">
            <CheckCircle2 size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">En revisión</span>
            <p className="gr-stat-value">{enRevision}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--orange">
            <Clock size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">En proceso</span>
            <p className="gr-stat-value">{enProceso}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--green">
            <CheckCheck size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Resueltos</span>
            <p className="gr-stat-value">{resueltos}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--rose">
            <XCircle size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Rechazados</span>
            <p className="gr-stat-value">{rechazados}</p>
          </div>
        </div>
      </div>

      {/* FILTROS AVANZADOS */}
      <div className="gr-filters">
        <div className="gr-filter-group">
          <label className="gr-filter-label">Desde</label>
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) => actualizarFiltro("fechaDesde", e.target.value)}
            className="gr-filter-input"
          />
        </div>

        <div className="gr-filter-group">
          <label className="gr-filter-label">Hasta</label>
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) => actualizarFiltro("fechaHasta", e.target.value)}
            className="gr-filter-input"
          />
        </div>

        <div className="gr-filter-group">
          <label className="gr-filter-label">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => actualizarFiltro("estado", e.target.value)}
            className="gr-filter-select"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="En proceso">En proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        <div className="gr-filter-group">
          <label className="gr-filter-label">Barrio / Zona</label>
          <select
            value={filtros.barrio}
            onChange={(e) => actualizarFiltro("barrio", e.target.value)}
            className="gr-filter-select"
          >
            <option value="">Todos los barrios</option>
            <option value="Morón">Morón Centro</option>
            <option value="Castelar">Castelar</option>
            <option value="Haedo">Haedo</option>
            <option value="Palomar">El Palomar</option>
            <option value="Sarmiento">Villa Sarmiento</option>
          </select>
        </div>

        <div className="gr-filter-group">
          <label className="gr-filter-label">Ciudadano / Mail</label>
          <div className="gr-filter-input-wrap">
            <User size={16} />
            <input
              type="text"
              value={filtros.usuario}
              onChange={(e) => actualizarFiltro("usuario", e.target.value)}
              placeholder="Nombre o email"
              className="gr-filter-input"
            />
          </div>
        </div>

        <button onClick={limpiarFiltros} className="gr-btn-clear">
          <RotateCcw size={15} />
          Limpiar filtros
        </button>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="gr-table-wrap">
        <div className="gr-table-scroll">
          <table className="gr-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Ciudadano</th>
                <th>Fecha / Hora</th>
                <th>Detalle de Incidencia</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones / Cambio de Estado</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="gr-empty">
                    Cargando reportes...
                  </td>
                </tr>
              ) : reportesPagina.length === 0 ? (
                <tr>
                  <td colSpan={7} className="gr-empty">
                    No hay reportes de incidencias para mostrar.
                  </td>
                </tr>
              ) : (
                reportesPagina.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="gr-res-id">#{item.nroOrden}</div>
                    </td>

                    <td>
                      <div className="gr-user-cell">
                        <div className="gr-avatar">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="gr-user-name">{item.usuario}</div>
                          <div className="gr-user-email">{item.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="gr-date-time">
                        <span className="gr-date">{item.fecha}</span>
                        <span className="gr-time">{item.hora}</span>
                      </div>
                    </td>

                    <td className="gr-menu-name">
                      <strong>{item.titulo}</strong>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{item.barrio}</div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: item.prioridad === "Alta" ? "#ef4444" : item.prioridad === "Media" ? "#f59e0b" : "#3b82f6",
                          color: "white",
                        }}
                      >
                        {item.prioridad} ({item.apoyos} apoyos)
                      </span>
                    </td>

                    <td>
                      <span className="gr-badge" style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #334155" }}>
                        {item.estado}
                      </span>
                    </td>

                    <td>
                      <div className="gr-actions">
                        <button
                          onClick={() => setReporteSeleccionado(item)}
                          title="Ver detalle completo"
                          className="gr-action-btn gr-action-btn--view"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => cambiarEstado(item.id, "En revisión")}
                          title="Marcar En revisión"
                          style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          En revisión
                        </button>

                        <button
                          onClick={() => cambiarEstado(item.id, "En proceso")}
                          title="Marcar En proceso"
                          style={{ background: "#f97316", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          En proceso
                        </button>

                        <button
                          onClick={() => cambiarEstado(item.id, "Resuelto")}
                          title="Marcar Resuelto"
                          style={{ background: "#22c55e", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Resuelto
                        </button>

                        <button
                          onClick={() => cambiarEstado(item.id, "Rechazado")}
                          title="Desestimar / Rechazar"
                          style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="gr-pagination-row">
          <span className="gr-pagination-info">
            Mostrando{" "}
            {reportesFiltrados.length === 0 ? 0 : (pagina - 1) * PAGE_SIZE + 1}{" "}
            - {Math.min(pagina * PAGE_SIZE, reportesFiltrados.length)} de{" "}
            {reportesFiltrados.length}
          </span>

          <div className="gr-pagination-btns">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
              className="gr-page-btn"
            >
              Anterior
            </button>

            <span className="gr-page-number">
              {pagina} / {totalPaginas}
            </span>

            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((prev) => Math.min(totalPaginas, prev + 1))}
              className="gr-page-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENTE INTEGRADO DE AUDITORÍA */}
      <div style={{ marginTop: "32px" }}>
        <LogAuditoria logsAdicionales={logsAuditoria} />
      </div>

      {/* MODAL DETALLES */}
      {reporteSeleccionado && (
        <div className="gr-modal">
          <div className="gr-modal-content" style={{ background: "#0f172a", color: "white", padding: "24px", borderRadius: "12px", border: "1px solid #334155", maxWidth: "540px", margin: "40px auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Ticket #{reporteSeleccionado.nroOrden}</h2>
              <button onClick={() => setReporteSeleccionado(null)} style={{ background: "#334155", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}>✕ Cerrar</button>
            </div>
            <p style={{ color: "#f8fafc", fontSize: "15px", fontWeight: 600 }}>{reporteSeleccionado.titulo}</p>
            <p style={{ color: "#cbd5e1", fontSize: "13px" }}>{reporteSeleccionado.descripcion}</p>
            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "8px", marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div><strong>Ubicación:</strong> {reporteSeleccionado.barrio}</div>
              <div><strong>Estado:</strong> {reporteSeleccionado.estado}</div>
              <div><strong>Prioridad:</strong> {reporteSeleccionado.prioridad}</div>
              <div><strong>Apoyos vecinales:</strong> {reporteSeleccionado.apoyos}</div>
              <div><strong>Ciudadano:</strong> {reporteSeleccionado.usuario}</div>
              <div><strong>Email:</strong> {reporteSeleccionado.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
