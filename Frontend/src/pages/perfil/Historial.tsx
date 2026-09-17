import "../../styles/perfil/Historial.css";
import TarjetaHistorial from "../../components/Historial";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

interface Pedido {
  id: number;
  titulo?: string;
  descripcion?: string;
  fechaPedido: string;
  estado: string;
  nroOrden?: number;
  valor?: number;
  tiempoEstimado?: string;
  metodoPago?: string | number;
}

function Historial() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const idUsuario = usuario.id || usuario.Id;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    if (idUsuario) {
      fetch(`${API_BASE_URL}/api/pedido/Usuario/${idUsuario}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener historial");
          return res.json();
        })
        .then((data: Pedido[]) => setPedidos(data))
        .catch((err) => console.error(err));
    }
  }, [idUsuario]);

  const historial = pedidos.filter(
    (p) => p.estado === "Entregado" || p.estado === "Cancelado",
  );

  return (
    <section className="home-page">
      <main className="home-content">
        <div className="home-header">
          <h1 className="home-title">Historial</h1>
          <p className="home-subtitle">Tus incidentes y reportes anteriores en Morón</p>
        </div>

        <div className="home-grid">
          {historial.length === 0 ? (
            <p style={{ color: "white" }}>No tenés incidentes anteriores registrados.</p>
          ) : (
            historial.map((pedido) => (
              <TarjetaHistorial key={pedido.id} pedido={pedido} />
            ))
          )}
        </div>
      </main>
    </section>
  );
}

export default Historial;
