import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  ShoppingBasket,
  Ban,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import "../../styles/admin/Estadisticas.css";
import { API_BASE_URL } from "../../config/api";

interface Resumen {
  reservasHoy: number;
  cancelaciones: number;
  productoMasPedido: string;
  cantidadProductoMasPedido: number;
  ingresosHoy: number;
}

interface ReservaPorHora {
  hora: string;
  reservas: number;
}

interface Operacion {
  hora: string;
  usuario: string;
  producto: string;
  estado: string;
  total: number;
}

interface EstadisticasData {
  resumen: Resumen;
  reservasPorHora: ReservaPorHora[];
  operaciones: Operacion[];
}

function Estadisticas() {
  const [datos, setDatos] = useState<EstadisticasData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setCargando(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/Estadisticas`
        );

        if (!response.ok) {
          throw new Error("No se pudieron obtener las estadísticas");
        }

        const data: EstadisticasData = await response.json();
        setDatos(data);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  const exportarExcel = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Estadisticas/exportar-excel`
      );

      if (!response.ok) {
        throw new Error("Error al generar el Excel");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "estadisticas.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("No se pudo exportar el archivo Excel");
    }
  };

  if (cargando) {
    return (
      <section className="estadisticas-home">
        <header className="estadisticas-header">
          <span className="estadisticas-tag">Panel Administrativo</span>
          <h1>Estadísticas</h1>
          <p>Cargando información del comedor...</p>
        </header>
      </section>
    );
  }

  if (error || !datos) {
    return (
      <section className="estadisticas-home">
        <header className="estadisticas-header">
          <span className="estadisticas-tag">Panel Administrativo</span>
          <h1>Estadísticas</h1>
          <p>{error || "No hay estadísticas disponibles."}</p>
        </header>
      </section>
    );
  }

  const { resumen, reservasPorHora, operaciones } = datos;

  return (
    <section className="estadisticas-home">
      <header className="estadisticas-header">
        <span className="estadisticas-tag">Panel Administrativo</span>
        <h1>Estadísticas</h1>
        <p>
          Visualizá la información más importante del comedor en tiempo real.
        </p>

        <button
          className="btn-exportar-excel"
          onClick={exportarExcel}
        >
          📊 Exportar Excel
        </button>
      </header>

      <div className="estadisticas-resumen">
        <article className="estadistica-card">
          <div className="estadistica-icon">
            <CalendarDays size={34} />
          </div>

          <span>Reservas HOY</span>

          <h2>{resumen.reservasHoy}</h2>

          <small>Pedidos realizados hoy</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <Ban size={34} />
          </div>

          <span>Cancelaciones</span>

          <h2 className="danger">{resumen.cancelaciones}</h2>

          <small>Pedidos cancelados hoy</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <ShoppingBasket size={34} />
          </div>

          <span>Producto más pedido</span>

          <h3>
            {resumen.productoMasPedido || "Sin pedidos"}
          </h3>

          <small>
            {resumen.cantidadProductoMasPedido} unidades hoy
          </small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <CircleDollarSign size={34} />
          </div>

          <span>Ingresos del día</span>

          <h2>
            ${resumen.ingresosHoy.toLocaleString("es-AR")}
          </h2>

          <small>Pedidos entregados hoy</small>
        </article>
      </div>

      <section className="grafico-card">
        <div className="card-title">
          <h3>Reservas por hora</h3>

          <p>
            Cantidad de pedidos realizados durante el día.
          </p>
        </div>

        <div className="grafico-container">
          {reservasPorHora.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reservasPorHora}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  stroke="#CBD5E1"
                  dataKey="hora"
                />

                <YAxis
                  stroke="#CBD5E1"
                  allowDecimals={false}
                />

                <Tooltip />

                <Bar
                  dataKey="reservas"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <h2>No hay pedidos registrados hoy.</h2>
          )}
        </div>
      </section>

      <section className="tabla-card">
        <div className="card-title">
          <h3>Operaciones recientes</h3>

          <p>
            Últimos movimientos registrados.
          </p>
        </div>

        {operaciones.length > 0 ? (
          <table className="tabla-estadisticas">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {operaciones.map((item, index) => (
                <tr key={index}>
                  <td>{item.hora}</td>

                  <td>{item.usuario}</td>

                  <td>{item.producto}</td>

                  <td>
                    <span
                      className={`estado ${item.estado.toLowerCase()}`}
                    >
                      {item.estado}
                    </span>
                  </td>

                  <td>
                    ${item.total.toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay operaciones registradas.</p>
        )}
      </section>
    </section>
  );
}

export default Estadisticas;
