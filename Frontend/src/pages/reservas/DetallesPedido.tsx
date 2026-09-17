import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Hash,
  ChefHat,
  CircleDollarSign,
  Package,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import "../../styles/reservas/DetallesPedido.css";
import { API_BASE_URL } from "../../config/api";

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

function DetallesPedido() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        setCargando(true);
        const response = await fetch(`${API_BASE_URL}/api/pedido/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar la información del pedido");
        }
        const data = await response.json();
        setPedido(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al obtener el pedido");
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
            <h2>Detalles del pedido</h2>
            <p>Cargando información...</p>
          </div>
        </header>
        <div className="dp-card">
          <p style={{ textAlign: "center", padding: "2rem", color: "#5a6490" }}>
            Cargando detalles de tu reserva...
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
            <h2>Detalles del pedido</h2>
            <p>Error</p>
          </div>
        </header>
        <div className="dp-card">
          <p style={{ textAlign: "center", padding: "2rem", color: "#c0392b" }}>
            {error || "No se encontró el pedido solicitado."}
          </p>
        </div>
      </section>
    );
  }

  // Formatear método de pago
  const formatoMetodoPago =
    pedido.metodoPago === 0 || pedido.metodoPago === "Efectivo"
      ? "Efectivo"
      : pedido.metodoPago === 4 || pedido.metodoPago === "MercadoPago"
      ? "Mercado Pago"
      : String(pedido.metodoPago);

  // Formatear fecha y hora
  const fechaObj = pedido.fechaPedido ? new Date(pedido.fechaPedido) : null;
  const fechaValida = fechaObj && !isNaN(fechaObj.getTime());

  const fechaFormateada = fechaValida
    ? fechaObj.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin fecha";

  const horaFormateada = fechaValida
    ? fechaObj.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " hs"
    : "Sin hora";

  const descripcionTexto =
    pedido.descripcion ||
    pedido.titulo ||
    (pedido.productos && pedido.productos.length > 0
      ? pedido.productos.map((p) => `${p.cantidad}x ${p.nombre}`).join(", ")
      : "Reporte de incidente municipal");

  return (
    <section className="dp-section">
      <header className="dp-header">
        <button className="dp-volver" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>

        <div>
          <h2>Detalles del incidente</h2>
          <p>Información completa y estado de la solicitud</p>
        </div>
      </header>

      <div className="dp-card">
        <h1 className="dp-orden">Incidente #{pedido.nroOrden || pedido.id}</h1>

        <div className="dp-info">
          <div className="dp-info-item">
            <Hash size={24} />
            <div>
              <strong>Número de ticket</strong>
              <span>{pedido.nroOrden || pedido.id}</span>
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
            <CircleDollarSign size={24} />
            <div>
              <strong>Vía de seguimiento</strong>
              <span>{formatoMetodoPago === "Efectivo" ? "Plataforma" : "Digital"}</span>
            </div>
          </div>

          <div className="dp-info-item">
            <Package size={24} />
            <div>
              <strong>Servicios</strong>
              <span>{pedido.productos ? pedido.productos.length : 0}</span>
            </div>
          </div>
        </div>

        <div className="dp-separador"></div>

        <div className="dp-bloque">
          <h4>Servicios o rubros vinculados</h4>

          {pedido.productos && pedido.productos.length > 0 ? (
            pedido.productos.map((producto, index) => (
              <div key={index} className="dp-producto">
                <span>
                  {producto.cantidad} × {producto.nombre}
                </span>

                <span>Registrado</span>
              </div>
            ))
          ) : (
            <p style={{ color: "#5a6490" }}>No hay detalle de rubros.</p>
          )}
        </div>

        <div className="dp-separador"></div>

        <div className="dp-bloque">
          <h4>Descripción del incidente</h4>

          <p>{descripcionTexto}</p>
        </div>
      </div>
    </section>
  );
}

export default DetallesPedido;
