import { useEffect, useMemo, useState } from "react";
import "../../styles/admin/GestionarReservas_Admin.css";
import {
  CalendarDays,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  CheckCheck,
  X,
  User,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export type EstadoReserva =
  | "Pendiente"
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
}

const API_URL = `${API_BASE_URL}/api/Pedido`;
const PAGE_SIZE = 6;

export default function GestionarReservas_Admin() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState<FiltrosReservas>({
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
    usuario: "",
  });

  const [pagina, setPagina] = useState(1);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null,
  );

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("No se pudieron obtener los pedidos.");
      }

      const data: Pedido[] = await response.json();

      const reservasConvertidas: Reserva[] = data.map((pedido) => {
        const fecha = new Date(pedido.fechaPedido);

        return {
          id: pedido.id.toString(),

          usuario: pedido.usuario
            ? `${pedido.usuario.nombre} ${pedido.usuario.apellido}`
            : `Usuario #${pedido.idUsuario}`,

          email: pedido.usuario?.email ?? "Sin email",

          fecha: fecha.toLocaleDateString("es-AR"),

          hora: fecha.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),

          menu: pedido.descripcion || pedido.titulo,

          precio: `$${pedido.valor.toLocaleString("es-AR")}`,

          estado: pedido.estado,

          pedido,
        };
      });

      setReservas(reservasConvertidas);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((reserva) => {
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

      const coincideEstado =
        !filtros.estado || reserva.estado === filtros.estado;

      const usuarioBusqueda = filtros.usuario.toLowerCase().trim();

      const coincideUsuario =
        !usuarioBusqueda ||
        reserva.usuario.toLowerCase().includes(usuarioBusqueda) ||
        reserva.email.toLowerCase().includes(usuarioBusqueda);

      return (
        coincideFechaDesde &&
        coincideFechaHasta &&
        coincideEstado &&
        coincideUsuario
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

  const pendientes = reservas.filter((r) => r.estado === "Pendiente").length;

  const aceptadas = reservas.filter((r) => r.estado === "Aceptado").length;

  const preparando = reservas.filter((r) => r.estado === "Preparando").length;

  const entregadas = reservas.filter((r) => r.estado === "Entregado").length;

  const canceladas = reservas.filter((r) => r.estado === "Cancelado").length;

  const cambiarEstado = async (id: string, estado: EstadoReserva) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado.");
      }

      await cargarPedidos();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado del pedido.");
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      estado: "",
      usuario: "",
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

  const obtenerClaseEstado = (estado: EstadoReserva) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";

      case "Aceptado":
        return "bg-blue-100 text-blue-700";

      case "Preparando":
        return "bg-orange-100 text-orange-700";

      case "Listo":
        return "bg-purple-100 text-purple-700";

      case "Entregado":
        return "bg-green-100 text-green-700";

      case "Cancelado":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const obtenerIconoEstado = (estado: EstadoReserva) => {
    switch (estado) {
      case "Pendiente":
        return <Clock size={14} />;

      case "Aceptado":
        return <CheckCircle2 size={14} />;

      case "Preparando":
        return <Clock size={14} />;

      case "Listo":
        return <CheckCheck size={14} />;

      case "Entregado":
        return <CheckCheck size={14} />;

      case "Cancelado":
        return <XCircle size={14} />;

      default:
        return null;
    }
  };

  const mostrarProductos = (pedido: Pedido) => {
    return pedido.productos
      .map((producto) => `${producto.cantidad}x ${producto.nombre}`)
      .join(", ");
  };

  return (
    <div className="gr-page">
      <div className="gr-header">
        <div>
          <span className="gr-tag">ADMINISTRACIÓN</span>

          <h1 className="gr-title">Gestionar pedidos</h1>

          <p className="gr-subtitle">
            Administrá los pedidos realizados por los usuarios.
          </p>
        </div>

        <button onClick={cargarPedidos} className="gr-btn-update">
          <RotateCcw size={16} />
          Actualizar
        </button>
      </div>

      {error && <div className="gr-error">{error}</div>}

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
            <span className="gr-stat-label">Aceptados</span>
            <p className="gr-stat-value">{aceptadas}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--orange">
            <Clock size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Preparando</span>
            <p className="gr-stat-value">{preparando}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--green">
            <CheckCheck size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Entregados</span>
            <p className="gr-stat-value">{entregadas}</p>
          </div>
        </div>

        <div className="gr-stat-card">
          <div className="gr-stat-icon gr-stat-icon--rose">
            <XCircle size={20} />
          </div>
          <div className="gr-stat-info">
            <span className="gr-stat-label">Cancelados</span>
            <p className="gr-stat-value">{canceladas}</p>
          </div>
        </div>
      </div>

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
            <option value="Aceptado">Aceptado</option>
            <option value="Preparando">Preparando</option>
            <option value="Listo">Listo</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div className="gr-filter-group">
          <label className="gr-filter-label">Usuario</label>

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

      <div className="gr-table-wrap">
        <div className="gr-table-scroll">
          <table className="gr-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="gr-empty">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : reservasPagina.length === 0 ? (
                <tr>
                  <td colSpan={7} className="gr-empty">
                    No hay pedidos para mostrar.
                  </td>
                </tr>
              ) : (
                reservasPagina.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>
                      <div className="gr-res-id">
                        #{reserva.pedido.nroOrden}
                      </div>
                      <small>ID #{reserva.id}</small>
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
                      {mostrarProductos(reserva.pedido)}
                    </td>

                    <td className="gr-menu-price">{reserva.precio}</td>

                    <td>
                      <span
                        className={`gr-badge ${obtenerClaseEstado(
                          reserva.estado,
                        )}`}
                      >
                        {obtenerIconoEstado(reserva.estado)}
                        {reserva.estado}
                      </span>
                    </td>

                    <td>
                      <div className="gr-actions">
                        <button
                          onClick={() => setPedidoSeleccionado(reserva.pedido)}
                          title="Ver pedido"
                          className="gr-action-btn gr-action-btn--view"
                        >
                          <Eye size={16} />
                        </button>

                        {reserva.estado === "Pendiente" && (
                          <button
                            onClick={() =>
                              cambiarEstado(reserva.id, "Aceptado")
                            }
                            title="Aceptar pedido"
                            className="gr-action-btn gr-action-btn--complete"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}

                        {reserva.estado === "Aceptado" && (
                          <button
                            onClick={() =>
                              cambiarEstado(reserva.id, "Preparando")
                            }
                            title="Comenzar preparación"
                            className="gr-action-btn gr-action-btn--complete"
                          >
                            <Clock size={16} />
                          </button>
                        )}

                        {reserva.estado === "Preparando" && (
                          <button
                            onClick={() => cambiarEstado(reserva.id, "Listo")}
                            title="Marcar como listo"
                            className="gr-action-btn gr-action-btn--complete"
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}

                        {reserva.estado === "Listo" && (
                          <button
                            onClick={() =>
                              cambiarEstado(reserva.id, "Entregado")
                            }
                            title="Marcar como entregado"
                            className="gr-action-btn gr-action-btn--complete"
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}

                        {reserva.estado !== "Cancelado" &&
                          reserva.estado !== "Entregado" && (
                            <button
                              onClick={() =>
                                cambiarEstado(reserva.id, "Cancelado")
                              }
                              title="Cancelar pedido"
                              className="gr-action-btn gr-action-btn--cancel"
                            >
                              <X size={16} />
                            </button>
                          )}
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
              onClick={() =>
                setPagina((prev) => Math.min(totalPaginas, prev + 1))
              }
              className="gr-page-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {pedidoSeleccionado && (
        <div className="gr-modal">
          <div className="gr-modal-content">
            <div className="gr-modal-header">
              <div>
                <h2>Pedido #{pedidoSeleccionado.nroOrden}</h2>
                <p>ID #{pedidoSeleccionado.id}</p>
              </div>

              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="gr-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="gr-modal-body">
              <div className="gr-modal-section">
                <span>Usuario</span>

                <strong>
                  {pedidoSeleccionado.usuario
                    ? `${pedidoSeleccionado.usuario.nombre} ${pedidoSeleccionado.usuario.apellido}`
                    : `Usuario #${pedidoSeleccionado.idUsuario}`}
                </strong>

                {pedidoSeleccionado.usuario && (
                  <p>{pedidoSeleccionado.usuario.email}</p>
                )}
              </div>

              <div className="gr-modal-section">
                <span>Productos</span>

                <div className="gr-modal-products">
                  {pedidoSeleccionado.productos.map((producto, index) => (
                    <div key={index} className="gr-modal-product">
                      <div>
                        <strong>{producto.nombre}</strong>
                        <small>Cantidad: {producto.cantidad}</small>
                      </div>

                      <strong>
                        $
                        {(
                          producto.precioUnitario * producto.cantidad
                        ).toLocaleString("es-AR")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gr-modal-data">
                <div>
                  <span>Método de pago</span>
                  <strong>{pedidoSeleccionado.metodoPago}</strong>
                </div>

                <div>
                  <span>Tiempo estimado</span>
                  <strong>{pedidoSeleccionado.tiempoEstimado}</strong>
                </div>
              </div>

              <div className="gr-modal-total">
                <span>Total</span>

                <strong>
                  ${pedidoSeleccionado.valor.toLocaleString("es-AR")}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
