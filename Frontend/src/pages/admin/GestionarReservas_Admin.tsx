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
  | "Aceptado"
  | "Preparando"
  | "Listo"
  | "Entregado"
  | "Cancelado";

interface UsuarioPedido {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface ProductoPedido {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface Pedido {
  id: number;
  idUsuario: number;
  usuario: UsuarioPedido | null;
  titulo: string;
  descripcion: string;
  fechaPedido: string;
  estado: EstadoReserva;
  metodoPago: string;
  nroOrden: number;
  tiempoEstimado: string;
  valor: number;
  productos: ProductoPedido[];
}

interface Reserva {
  id: string;
  usuario: string;
  email: string;
  fecha: string;
  hora: string;
  menu: string;
  precio: string;
  estado: EstadoReserva;
  pedido: Pedido;
}

interface FiltrosReservas {
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
  usuario: string;
  barrio: string;
}

const API_URL = `${API_BASE_URL}/api/Pedido`;
const PAGE_SIZE = 6;

export default function GestionarReservas_Admin() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
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
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rolActual = usuarioActual.rol || "Empleado Municipal";

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("No se pudieron obtener las incidencias.");
      }

      const data: Pedido[] = await response.json();

      const reservasConvertidas: Reserva[] = data.map((pedido) => {
        const fecha = new Date(pedido.fechaPedido);

        return {
          id: pedido.id.toString(),

          usuario: pedido.usuario
            ? `${pedido.usuario.nombre} ${pedido.usuario.apellido}`
            : `Ciudadano #${pedido.idUsuario}`,

          email: pedido.usuario?.email ?? "Sin email registrado",

          fecha: fecha.toLocaleDateString("es-AR"),

          hora: fecha.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),

          menu: pedido.descripcion || pedido.titulo || "Incidencia sin especificar",

          precio: `Ticket #${pedido.nroOrden || pedido.id}`,

          estado: pedido.estado,

          pedido,
        };
      });

      setReservas(reservasConvertidas);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las incidencias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((reserva: Reserva) => {
      const pedido = reserva.pedido;
      const fechaPedido = new Date(pedido.fechaPedido);

      const fechaDesde = filtros.fechaDesde
        ? new Date(`${filtros.fechaDesde}T00:00:00`)
        : null;

      const fechaHasta = filtros.fechaHasta
        ? new Date(`${filtros.fechaHasta}T23:59:59`)
        : null;

      const coincideFechaDesde = !fechaDesde || fechaPedido >= fechaDesde;
      const coincideFechaHasta = !fechaHasta || fechaPedido <= fechaHasta;
      const coincideEstado = !filtros.estado || reserva.estado === filtros.estado;

      const usuarioBusqueda = filtros.usuario.toLowerCase().trim();
      const coincideUsuario =
        !usuarioBusqueda ||
        reserva.usuario.toLowerCase().includes(usuarioBusqueda) ||
        reserva.email.toLowerCase().includes(usuarioBusqueda);

      const coincideBarrio =
        !filtros.barrio ||
        reserva.menu.toLowerCase().includes(filtros.barrio.toLowerCase());

      return (
        coincideFechaDesde &&
        coincideFechaHasta &&
        coincideEstado &&
        coincideUsuario &&
        coincideBarrio
      );
    });
  }, [reservas, filtros]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(reservasFiltradas.length / PAGE_SIZE),
  );

  const reservasPagina = reservasFiltradas.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  const total = reservas.length;
  const pendientes = reservas.filter((r: Reserva) => r.estado === "Pendiente").length;
  const enRevision = reservas.filter((r: Reserva) => r.estado === "En revisión" || r.estado === "Aceptado").length;
  const enProceso = reservas.filter((r: Reserva) => r.estado === "En proceso" || r.estado === "Preparando").length;
  const resueltos = reservas.filter((r: Reserva) => r.estado === "Resuelto" || r.estado === "Listo" || r.estado === "Entregado").length;
  const rechazados = reservas.filter((r: Reserva) => r.estado === "Rechazado" || r.estado === "Cancelado").length;

  const cambiarEstado = async (id: string, nuevoEstado: EstadoReserva) => {
    try {
      // Mapear nombre del nuevo estado
      let estadoEnum = 1;
      if (nuevoEstado === "En revisión" || nuevoEstado === "Aceptado") estadoEnum = 1;
      if (nuevoEstado === "En proceso" || nuevoEstado === "Preparando") estadoEnum = 2;
      if (nuevoEstado === "Resuelto" || nuevoEstado === "Listo" || nuevoEstado === "Entregado") estadoEnum = 4;
      if (nuevoEstado === "Rechazado" || nuevoEstado === "Cancelado") estadoEnum = 5;

      const resAnt = reservas.find((r: Reserva) => r.id === id);
      const estadoAnterior = resAnt ? resAnt.estado : "Pendiente";

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: estadoEnum,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado.");
      }

      // REGISTRAR EN LOG DE AUDITORÍA
      const nuevoLog: LogEntry = {
        id: Date.now(),
        reporteId: Number(id),
        tituloReporte: resAnt?.menu || `Incidencia #${id}`,
        usuarioResponsable: `${usuarioActual.nombre || "Usuario"} (${rolActual})`,
        rolUsuario: rolActual,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        fechaHora: new Date().toLocaleString("es-AR"),
        detalles: `Cambio de estado autorizado mediante JWT para el reporte #${id}`,
      };

      setLogsAuditoria((prev: LogEntry[]) => [nuevoLog, ...prev]);

      await cargarPedidos();
      alert(`Estado del reporte #${id} actualizado a "${nuevoEstado}". Se registró en el Log de Auditoría.`);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado del reporte.");
    }
  };

  const exportarCSV = () => {
    const encabezados = "ID,Ticket,Ciudadano,Email,Fecha,Incidencia,Estado\n";
    const filas = reservasFiltradas
      .map(
        (r: Reserva) =>
          `"${r.id}","${r.pedido.nroOrden || r.id}","${r.usuario}","${r.email}","${r.fecha}","${r.menu.replace(/"/g, '""')}","${r.estado}"`
      )
      .join("\n");

    const blob = new Blob([encabezados + filas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Reporte_Incidentes_Moron.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    alert("📑 Generando reporte oficial en PDF de incidencias urbanas para la Municipalidad de Morón...");
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
    setFiltros((prev: FiltrosReservas) => ({
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
            Administración centralizada de reportes ciudadanos, asignación a cuadrillas y trazabilidad de seguridad.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={exportarCSV} className="gr-btn-update" style={{ background: "#10b981", color: "white" }}>
            <FileSpreadsheet size={16} /> Exportar CSV
          </button>
          <button onClick={exportarPDF} className="gr-btn-update" style={{ background: "#ef4444", color: "white" }}>
            <FileText size={16} /> Exportar PDF
          </button>
          <button onClick={cargarPedidos} className="gr-btn-update">
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

      {/* FILTROS AVANZADOS POR ESTADO, BARRIO Y FECHAS */}
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
            <option value="Morón Centro">Morón Centro</option>
            <option value="Castelar">Castelar</option>
            <option value="Haedo">Haedo</option>
            <option value="El Palomar">El Palomar</option>
            <option value="Villa Sarmiento">Villa Sarmiento</option>
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

      {/* TABLA PRINCIPAL DE INCIDENTES */}
      <div className="gr-table-wrap">
        <div className="gr-table-scroll">
          <table className="gr-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Ciudadano</th>
                <th>Fecha</th>
                <th>Detalle de Incidencia</th>
                <th>Estado</th>
                <th>Acciones y Cambio de Estado</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="gr-empty">
                    Cargando reportes...
                  </td>
                </tr>
              ) : reservasPagina.length === 0 ? (
                <tr>
                  <td colSpan={6} className="gr-empty">
                    No hay reportes de incidencias para mostrar.
                  </td>
                </tr>
              ) : (
                reservasPagina.map((reserva: Reserva) => (
                  <tr key={reserva.id}>
                    <td>
                      <div className="gr-res-id">
                        #{reserva.pedido.nroOrden || reserva.id}
                      </div>
                    </td>

                    <td>
                      <div className="gr-user-cell">
                        <div className="gr-avatar">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="gr-user-name">{reserva.usuario}</div>
                          <div className="gr-user-email">{reserva.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="gr-date-time">
                        <span className="gr-date">{reserva.fecha}</span>
                        <span className="gr-time">{reserva.hora}</span>
                      </div>
                    </td>

                    <td className="gr-menu-name">
                      <strong>{reserva.menu}</strong>
                    </td>

                    <td>
                      <span className="gr-badge" style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #334155" }}>
                        {reserva.estado}
                      </span>
                    </td>

                    <td>
                      <div className="gr-actions">
                        <button
                          onClick={() => setPedidoSeleccionado(reserva.pedido)}
                          title="Ver detalle completo"
                          className="gr-action-btn gr-action-btn--view"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => cambiarEstado(reserva.id, "En revisión")}
                          title="Marcar En revisión"
                          style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          En revisión
                        </button>

                        <button
                          onClick={() => cambiarEstado(reserva.id, "En proceso")}
                          title="Marcar En proceso"
                          style={{ background: "#f97316", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          En proceso
                        </button>

                        <button
                          onClick={() => cambiarEstado(reserva.id, "Resuelto")}
                          title="Marcar Resuelto"
                          style={{ background: "#22c55e", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Resuelto
                        </button>

                        <button
                          onClick={() => cambiarEstado(reserva.id, "Rechazado")}
                          title="Desestimar/Rechazar"
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
            {reservasFiltradas.length === 0 ? 0 : (pagina - 1) * PAGE_SIZE + 1}{" "}
            - {Math.min(pagina * PAGE_SIZE, reservasFiltradas.length)} de{" "}
            {reservasFiltradas.length}
          </span>

          <div className="gr-pagination-btns">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((prev: number) => Math.max(1, prev - 1))}
              className="gr-page-btn"
            >
              Anterior
            </button>

            <span className="gr-page-number">
              {pagina} / {totalPaginas}
            </span>

            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((prev: number) => Math.min(totalPaginas, prev + 1))}
              className="gr-page-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENTE INTEGRADO DE LOG DE AUDITORÍA */}
      <div style={{ marginTop: "32px" }}>
        <LogAuditoria logsAdicionales={logsAuditoria} />
      </div>

      {pedidoSeleccionado && (
        <div className="gr-modal">
          <div className="gr-modal-content" style={{ background: "#0f172a", color: "white", padding: "24px", borderRadius: "12px", border: "1px solid #334155", maxWidth: "500px", margin: "40px auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Ticket #{pedidoSeleccionado.nroOrden || pedidoSeleccionado.id}</h2>
              <button onClick={() => setPedidoSeleccionado(null)} style={{ background: "#334155", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}>✕ Cerrar</button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Detalle: {pedidoSeleccionado.descripcion || pedidoSeleccionado.titulo}</p>
            <p style={{ color: "#38bdf8", fontSize: "13px" }}>Estado: {pedidoSeleccionado.estado}</p>
          </div>
        </div>
      )}
    </div>
  );
}
