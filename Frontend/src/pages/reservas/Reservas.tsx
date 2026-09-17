
import { useEffect, useState } from "react";
import "../../styles/reservas/Reservas.css";
import { API_BASE_URL } from "../../config/api";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
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

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  tipo: "producto" | "menu";
}

interface ReservasProps {
  setActiveSection: (section: string) => void;
}

function Reservar({ setActiveSection }: ReservasProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [menuDelDia, setMenuDelDia] = useState<Menu | null>(null);

  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    const guardado = localStorage.getItem("carrito");

    try {
      if (!guardado) {
        return [];
      }

      const datos = JSON.parse(guardado);

      return datos.map((item: any) => ({
        ...item,
        tipo: item.tipo || "producto",
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    obtenerProductos();
    obtenerMenuDelDia();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/producto`);

      if (!response.ok) {
        throw new Error("Error al obtener productos");
      }

      const data = await response.json();

      setProductos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerMenuDelDia = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Menu`);

      if (!response.ok) {
        throw new Error("Error al obtener el menú");
      }

      const data: Menu[] = await response.json();

      if (data.length > 0) {
        setMenuDelDia(data[0]);
      } else {
        setMenuDelDia(null);
      }
    } catch (error) {
      console.error("Error al obtener menú:", error);
    }
  };

  const agregarProducto = (
    id: number,
    nombre: string,
    precio: number
  ) => {
    const nuevo = [
      ...carrito,
      {
        id,
        nombre,
        precio,
        tipo: "producto" as const,
      },
    ];

    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));
  };

  const agregarMenu = () => {
    if (!menuDelDia) {
      return;
    }

    if (
      !menuDelDia.disponible ||
      menuDelDia.disponibilidad <= 0
    ) {
      alert("El menú no está disponible.");
      return;
    }

    const nuevo = [
      ...carrito,
      {
        id: menuDelDia.id,
        nombre: menuDelDia.nombre,
        precio: Number(menuDelDia.precio),
        tipo: "menu" as const,
      },
    ];

    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));
  };

  const eliminarProducto = (index: number) => {
    const nuevo = carrito.filter((_, i) => i !== index);

    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));
  };

  const total = carrito.reduce(
    (acc, item) => acc + Number(item.precio),
    0
  );

  const categoriasAgrupadas = productos.reduce(
    (acc: Record<string, Producto[]>, producto) => {
      if (!acc[producto.categoria]) {
        acc[producto.categoria] = [];
      }

      acc[producto.categoria].push(producto);

      return acc;
    },
    {}
  );

  const confirmarPedido = () => {
    if (carrito.length === 0) {
      alert(
        "No seleccionaste ningún servicio o categoría. Seleccioná al menos uno antes de confirmar."
      );
      return;
    }

    const usuarioRaw = localStorage.getItem("usuario");

    if (!usuarioRaw) {
      alert("Debés iniciar sesión para reportar un incidente.");
      return;
    }

    localStorage.setItem(
      "carrito",
      JSON.stringify(carrito)
    );

    setActiveSection("confirmar-pedido");
  };

  return (
    <section className="reservar-section">
      <div className="reservar-header">
        <h2>Reportar Incidente o Solicitud</h2>

        <span>
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {/* SERVICIO DESTACADO */}

      {menuDelDia ? (
        <div className="reservar-card">
          <div className="reservar-left">
            <div className="reservar-icon">
              <img src="/support.svg" alt="Servicio" />
            </div>

            <div className="reservar-info">
              <h3>{menuDelDia.nombre}</h3>

              <ul>
                <li>{menuDelDia.descripcion}</li>
              </ul>

              <p>
                Prioridad: {menuDelDia.disponibilidad > 50 ? "Estándar" : "Urgente"}
              </p>

              <p>
                Cupos de cuadrilla: {menuDelDia.disponibilidad}
              </p>
            </div>
          </div>

          <div className="reservar-button-container">
            <button
              className="reservar-button"
              disabled={
                !menuDelDia.disponible ||
                menuDelDia.disponibilidad <= 0
              }
              onClick={agregarMenu}
            >
              {menuDelDia.disponible &&
              menuDelDia.disponibilidad > 0
                ? "Solicitar intervención"
                : "No disponible"}
            </button>
          </div>
        </div>
      ) : (
        <div className="reservar-card">
          <div className="reservar-info">
            <h3>Atención y Soporte Municipal</h3>

            <p>
              Seleccioná a continuación el tipo de incidente que necesitás reportar en Morón.
            </p>
          </div>
        </div>
      )}

      {/* PRODUCTOS */}

      {Object.entries(categoriasAgrupadas).map(
        ([categoria, productos]) => (
          <div
            key={categoria}
            className="reservar-products-wrapper"
          >
            <div className="reservar-products-header">
              <h2>{categoria}</h2>
            </div>

            <div className="reservar-products-grid">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="reservar-product-card"
                >
                  <div className="reservar-product-icon">
                    🛠️
                  </div>

                  <h3>{producto.nombre}</h3>

                  <p>{producto.descripcion}</p>

                  <p className="reservar-price">
                    Prioridad: {producto.disponible ? "Activa" : "En pausa"}
                  </p>

                  <button
                    onClick={() =>
                      agregarProducto(
                        producto.id,
                        producto.nombre,
                        Number(producto.precio)
                      )
                    }
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* CARRITO / SOLICITUD */}

      <div className="reservar-cart">
        <div className="reservar-cart-header">
          📋 Mi Solicitud ({carrito.length})
        </div>

        {carrito.length === 0 ? (
          <p className="reservar-empty-cart">
            No hay servicios o categorías seleccionadas.
          </p>
        ) : (
          <>
            <ul className="reservar-cart-list">
              {carrito.map((item, index) => (
                <li key={index}>
                  <div>
                    <strong>{item.nombre}</strong>

                    {item.tipo === "menu" && (
                      <>
                        <br />
                        <small>Servicio destacado</small>
                      </>
                    )}
                  </div>

                  <button
                    className="reservar-remove-btn"
                    onClick={() =>
                      eliminarProducto(index)
                    }
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="reservar-confirm-btn"
              onClick={confirmarPedido}
            >
              Confirmar solicitud
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default Reservar;