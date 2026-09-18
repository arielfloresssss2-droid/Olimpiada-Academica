import { useEffect, useState } from "react";
import {
  PlusCircle,
  Package,
  Wrench,
} from "lucide-react";

import "../../styles/admin/GestionarMenu.css";
import { API_BASE_URL } from "../../config/api";

interface ServicioMunicipal {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponibilidad: number;
  fecha: string;
  disponible: boolean;
}

interface CategoriaIncidencia {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
}

export default function GestionarMenu() {
  const [servicios, setServicios] = useState<ServicioMunicipal[]>([]);
  const [categorias, setCategorias] = useState<CategoriaIncidencia[]>([]);

  const [nombreServicio, setNombreServicio] = useState("");
  const [descripcionServicio, setDescripcionServicio] = useState("");
  const [cuposCuadrilla, setCuposCuadrilla] = useState("50");

  const [nombreCategoria, setNombreCategoria] = useState("");
  const [descCategoria, setDescCategoria] = useState("");
  const [rubroNombre, setRubroNombre] = useState("Vía Pública");

  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setCargando(true);
      const resServ = await fetch(`${API_BASE_URL}/api/Menu`);
      if (resServ.ok) {
        const data = await resServ.json();
        setServicios(data);
      }

      const resCat = await fetch(`${API_BASE_URL}/api/Producto`);
      if (resCat.ok) {
        const data = await resCat.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const guardarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreServicio.trim() || !descripcionServicio.trim()) {
      alert("Completá el nombre y la descripción del servicio municipal.");
      return;
    }

    try {
      const datos = {
        nombre: nombreServicio,
        descripcion: descripcionServicio,
        precio: 0,
        disponibilidad: Number(cuposCuadrilla) || 50,
      };

      await fetch(`${API_BASE_URL}/api/Menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      setNombreServicio("");
      setDescripcionServicio("");
      cargarServicios();
      alert("Servicio municipal registrado correctamente.");
    } catch (err) {
      console.error(err);
    }
  };

  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCategoria.trim() || !descCategoria.trim()) {
      alert("Completá el nombre y la descripción del tipo de incidencia.");
      return;
    }

    try {
      const datos = {
        nombre: nombreCategoria,
        descripcion: descCategoria,
        precio: 0,
        categoria: rubroNombre,
        disponible: true,
      };

      await fetch(`${API_BASE_URL}/api/Producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      setNombreCategoria("");
      setDescCategoria("");
      cargarServicios();
      alert("Tipo de incidencia registrado correctamente.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="menu-admin">
      <header className="menu-header">
        <span className="menu-tag">Panel Administrativo Morón</span>
        <h1>Gestionar Servicios y Categorías Municipales</h1>
        <p>
          Configurá los rubros de incidentes (baches, alumbrado, higiene, semáforos, poda) y la capacidad de atención de las cuadrillas.
        </p>
      </header>

      {/* SECCIÓN 1: SERVICIOS Y CUADRILLAS */}
      <div className="menu-grid">
        <section className="menu-card">
          <div className="menu-card-title">
            <PlusCircle size={28} />
            <h2>Crear Servicio Municipal</h2>
          </div>

          <form className="menu-form" onSubmit={guardarServicio}>
            <div className="menu-input">
              <label>Nombre del Servicio</label>
              <input
                type="text"
                value={nombreServicio}
                onChange={(e) => setNombreServicio(e.target.value)}
                placeholder="Ej: Inspección y Reparación de Baches"
              />
            </div>

            <div className="menu-input">
              <label>Descripción del Área / Alcance</label>
              <textarea
                value={descripcionServicio}
                onChange={(e) => setDescripcionServicio(e.target.value)}
                rows={3}
                placeholder="Descripción del servicio y tareas a ejecutar..."
              />
            </div>

            <div className="menu-input">
              <label>Capacidad diaria de atención (Cuadrillas)</label>
              <input
                type="number"
                value={cuposCuadrilla}
                onChange={(e) => setCuposCuadrilla(e.target.value)}
                placeholder="50"
              />
            </div>

            <button type="submit" className="menu-button">
              Guardar Servicio Municipal
            </button>
          </form>
        </section>

        <section className="menu-card">
          <div className="menu-card-title">
            <Wrench size={28} />
            <h2>Servicios Activos Morón</h2>
          </div>

          <div className="menu-history">
            {cargando ? (
              <p>Cargando servicios...</p>
            ) : servicios.length === 0 ? (
              <p>No hay servicios cargados actualmente.</p>
            ) : (
              servicios.map((s: ServicioMunicipal) => (
                <article className="history-item" key={s.id}>
                  <div>
                    <h4>{s.nombre}</h4>
                    <p style={{ color: "#94a3b8", fontSize: "12px" }}>{s.descripcion}</p>
                    <span style={{ color: "#38bdf8", fontSize: "12px" }}>
                      Capacidad: {s.disponibilidad} solicitudes/día
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* SECCIÓN 2: TIPOS DE INCIDENCIA */}
      <div className="menu-section-divider" style={{ marginTop: "32px" }}>
        <h1>Gestión de Tipos de Incidencia</h1>
      </div>

      <div className="menu-grid">
        <section className="menu-card">
          <div className="menu-card-title">
            <Package size={28} />
            <h2>Crear Tipo de Incidencia</h2>
          </div>

          <form className="menu-form" onSubmit={guardarCategoria}>
            <div className="menu-input">
              <label>Nombre del Sub-tipo</label>
              <input
                type="text"
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                placeholder="Ej: Luminaria LED en cortocircuito"
              />
            </div>

            <div className="menu-input">
              <label>Rubro General</label>
              <input
                type="text"
                value={rubroNombre}
                onChange={(e) => setRubroNombre(e.target.value)}
                placeholder="Ej: Alumbrado Público"
              />
            </div>

            <div className="menu-input">
              <label>Descripción de verificación</label>
              <textarea
                value={descCategoria}
                onChange={(e) => setDescCategoria(e.target.value)}
                rows={3}
                placeholder="Instrucciones para el inspector municipal..."
              />
            </div>

            <button type="submit" className="menu-button">
              Guardar Tipo de Incidencia
            </button>
          </form>
        </section>

        <section className="menu-card">
          <div className="menu-card-title">
            <Package size={28} />
            <h2>Tipos Existentes</h2>
          </div>

          <div className="menu-history">
            {categorias.length === 0 ? (
              <p>No hay tipos de incidencia registrados.</p>
            ) : (
              categorias.map((c: CategoriaIncidencia) => (
                <article className="history-item" key={c.id}>
                  <div>
                    <h4>{c.nombre}</h4>
                    <span style={{ color: "#38bdf8", fontSize: "12px" }}>Rubro: {c.categoria}</span>
                    <p style={{ color: "#94a3b8", fontSize: "12px" }}>{c.descripcion}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
