import { useEffect, useState } from "react";
import "../../styles/home/Home.css";
import { API_BASE_URL } from "../../config/api";

interface InicioProps {
  setActiveSection: (section: string) => void;
}

interface Menu {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponibilidad: number;
  fecha: string;
  disponible: boolean;
}

interface ProductoCarrito {
  id: number;
  nombre: string;
  precio: number;
}

interface ProductoPedido {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface PedidoUsuario {
  id: number;
  nroOrden: number;
  titulo: string;
  descripcion: string;
  fechaPedido: string;
  estado: string; // "Pendiente", "Aceptado", "Preparando", "Listo", "Entregado", "Cancelado"
  metodoPago: number;
  tiempoEstimado: string;
  valor: number;
  productos: ProductoPedido[];
}

function Home({ setActiveSection }: InicioProps) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [menu, setMenu] = useState<Menu | null>(null);
  const [pedidos, setPedidos] = useState<PedidoUsuario[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Menu`);

        if (!response.ok) {
          throw new Error("No se pudo obtener el menú");
        }

        const data: Menu[] = await response.json();

        if (data.length > 0) {
          const menuDisponible = data
            .filter((item) => item.disponible && item.disponibilidad > 0)
            .sort(
              (a, b) =>
                new Date(b.fecha).getTime() -
                new Date(a.fecha).getTime()
            )[0];

          setMenu(menuDisponible || null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    cargarMenu();
  }, []);

  useEffect(() => {
    const cargarPedidosUsuario = async () => {
      const idUsuario = usuario.id || usuario.Id;
      if (!idUsuario) return;

      try {
        setCargandoPedidos(true);
        const response = await fetch(`${API_BASE_URL}/api/Pedido/Usuario/${idUsuario}`);

        if (!response.ok) {
          throw new Error("No se pudieron obtener los pedidos del usuario");
        }

        const data: PedidoUsuario[] = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error al cargar pedidos del usuario:", error);
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargarPedidosUsuario();
  }, [usuario.id, usuario.Id]);

  const agregarMenuAlPedido = () => {
    if (!menu) {
      return;
    }

    try {
      const carritoActual: ProductoCarrito[] = JSON.parse(
        localStorage.getItem("carrito") || "[]"
      );

      const menuCarrito: ProductoCarrito = {
        id: menu.id,
        nombre: menu.nombre,
        precio: menu.precio,
      };

      const nuevoCarrito = [...carritoActual, menuCarrito];

      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));

      setMensaje("Menú agregado al pedido");

      setTimeout(() => {
        setMensaje("");
        setActiveSection("reservar");
      }, 700);
    } catch (error) {
      console.error(error);
    }
  };

  // Calcular pedidos activos e historial
  const estadosActivos = ["Pendiente", "Aceptado", "Preparando", "Listo"];
  const pedidosActivos = pedidos.filter((p) => estadosActivos.includes(p.estado));
  const pedidoActivo = pedidosActivos.length > 0 ? pedidosActivos[0] : null;

  const pedidosEntregados = pedidos.filter((p) => p.estado === "Entregado");
  const totalGastado = pedidosEntregados.reduce((sum, p) => sum + p.valor, 0);

  // Obtener texto de la tarjeta de reserva en base al estado real
  const obtenerTituloReserva = () => {
    if (!pedidoActivo) return "Sin pedidos activos";
    switch (pedidoActivo.estado) {
      case "Pendiente":
        return "Reserva recibida";
      case "Aceptado":
        return "Reserva confirmada";
      case "Preparando":
        return "En preparación";
      case "Listo":
        return "¡Tu pedido está listo!";
      default:
        return "Estado del pedido";
    }
  };

  const obtenerTextoReserva = () => {
    if (!pedidoActivo) return "No tenés ningún pedido en proceso en este momento.";
    switch (pedidoActivo.estado) {
      case "Pendiente":
        return "Tu pedido fue recibido y está aguardando confirmación del buffet.";
      case "Aceptado":
        return `Tu pedido fue confirmado. Estará listo en aproximadamente ${pedidoActivo.tiempoEstimado || "20 min"}.`;
      case "Preparando":
        return `Tu pedido se está preparando. Tiempo estimado restante: ${pedidoActivo.tiempoEstimado || "15 min"}.`;
      case "Listo":
        return "¡Ya podés pasar a retirar tu pedido por el buffet!";
      default:
        return "";
    }
  };

  // Construir notificaciones dinámicas
  const generarNotificaciones = () => {
    const list: { icono: string; texto: string }[] = [];

    if (pedidoActivo) {
      if (pedidoActivo.estado === "Listo") {
        list.push({
          icono: "🎉",
          texto: `¡Tu pedido #${pedidoActivo.nroOrden} está listo! Podés pasar a retirarlo.`,
        });
      } else if (pedidoActivo.estado === "Preparando") {
        list.push({
          icono: "👨‍🍳",
          texto: `Tu pedido #${pedidoActivo.nroOrden} está en preparación (${pedidoActivo.tiempoEstimado || "falta poco"}).`,
        });
      } else if (pedidoActivo.estado === "Aceptado") {
        list.push({
          icono: "⏰",
          texto: `Tu pedido #${pedidoActivo.nroOrden} fue aceptado (Est: ${pedidoActivo.tiempoEstimado || "20 min"}).`,
        });
      } else if (pedidoActivo.estado === "Pendiente") {
        list.push({
          icono: "⏳",
          texto: `Tu pedido #${pedidoActivo.nroOrden} ingresó y espera confirmación del buffet.`,
        });
      }
    }

    const ultimoEntregado = pedidos.find((p) => p.estado === "Entregado");
    if (ultimoEntregado) {
      list.push({
        icono: "✅",
        texto: `Tu pedido #${ultimoEntregado.nroOrden} fue entregado. ¡Que lo disfrutés!`,
      });
    }

    const ultimoCancelado = pedidos.find((p) => p.estado === "Cancelado");
    if (ultimoCancelado) {
      list.push({
        icono: "❌",
        texto: `Tu pedido #${ultimoCancelado.nroOrden} fue cancelado.`,
      });
    }

    if (menu) {
      list.push({
        icono: "🍝",
        texto: `El menú del día hoy es ${menu.nombre}.`,
      });
    }

    list.push({
      icono: "⏰",
      texto: "Recordá reservar tu comida antes de las 10:00 hs.",
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
              Buen día, {usuario.nombre || "Usuario"} 👋
            </h1>

            <p className="home-subtitle">
              Recordá reservar tu comida antes de las 10:00 hs.
            </p>
          </div>
        </section>

        <section className="home-main-card">
          <div className="home-main-info">
            <span className="home-badge">MENÚ DEL DÍA</span>

            <h2>
              {menu ? menu.nombre : "No hay menú disponible"}
            </h2>

            <p>
              {menu
                ? menu.descripcion
                : "Todavía no hay un menú disponible para reservar."}
            </p>

            <div className="home-main-footer">
              <span className="home-price">
                {menu
                  ? `$${menu.precio.toLocaleString("es-AR")}`
                  : "No disponible"}
              </span>

              <button
                className="home-main-btn"
                onClick={agregarMenuAlPedido}
                disabled={!menu}
              >
                Agregar al pedido
              </button>
            </div>

            {mensaje && (
              <p className="home-subtitle">
                {mensaje}
              </p>
            )}
          </div>

          <div className="home-main-image">
            <img
              src="/menu-semanal.svg"
              width="200"
              height="150"
              alt="Menú del día"
            />
          </div>
        </section>

        <section className="home-grid">
          <div className="home-card">
            <div className="home-card-header">
              <h3>{obtenerTituloReserva()}</h3>

              <span
                className="home-success-dot"
                style={{
                  backgroundColor: !pedidoActivo
                    ? "#94a3b8"
                    : pedidoActivo.estado === "Listo"
                    ? "#22c55e"
                    : pedidoActivo.estado === "Preparando" || pedidoActivo.estado === "Aceptado"
                    ? "#f97316"
                    : "#eab308",
                  boxShadow: !pedidoActivo
                    ? "none"
                    : pedidoActivo.estado === "Listo"
                    ? "0 0 10px #22c55e"
                    : pedidoActivo.estado === "Preparando" || pedidoActivo.estado === "Aceptado"
                    ? "0 0 10px #f97316"
                    : "0 0 10px #eab308",
                }}
              />
            </div>

            <p className="home-card-text">
              {cargandoPedidos ? "Cargando información del pedido..." : obtenerTextoReserva()}
            </p>

            {pedidoActivo ? (
              <div className="home-qr">
                Pedido n° {pedidoActivo.nroOrden}
              </div>
            ) : (
              <button
                className="home-shortcut-btn w-full"
                onClick={() => setActiveSection("reservar")}
              >
                Hacer un pedido ahora
              </button>
            )}
          </div>

          <div className="home-card">
            <h3 className="home-card-title">
              Notificaciones
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
              Estadísticas
            </h3>

            <div className="home-stats">
              <div className="home-stat-box">
                <h4>{pedidosEntregados.length}</h4>
                <p>Comidas</p>
              </div>

              <div className="home-stat-box">
                <h4>${totalGastado.toLocaleString("es-AR")}</h4>
                <p>Gastado</p>
              </div>

              <div className="home-stat-box">
                <h4>{pedidosActivos.length}</h4>
                <p>En curso</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
