import { useEffect, useState } from "react";
import {
  PlusCircle,
  Tag,
  Trash2,
  CheckCircle,
} from "lucide-react";

import "../../styles/admin/GestionarMenu.css";
import { API_BASE_URL } from "../../config/api";

interface CategoriaIncidente {
  id: number;
  nombre: string;
  descripcion: string;
  totalReportes?: number;
}

export default function GestionarMenu() {
  const [categorias, setCategorias] = useState<CategoriaIncidente[]>([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [descCategoria, setDescCategoria] = useState("");
  const [cargando, setCargando] = useState(false);
  const [creando, setCreando] = useState(false);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/api/Incidente`);
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error("Error al cargar categorías de incidentes:", err);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreCategoria.trim()) {
      alert("Por favor ingrese el nombre del rubro / categoría.");
      return;
    }

    try {
      setCreando(true);
      const response = await fetch(`${API_BASE_URL}/api/Incidente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nombreCategoria.trim(),
          descripcion: descCategoria.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al crear la categoría.");
      }

      alert("¡Nueva categoría de incidencia registrada con éxito!");
      setNombreCategoria("");
      setDescCategoria("");
      await cargarCategorias();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al registrar la categoría.");
    } finally {
      setCreando(false);
    }
  };

  const handleEliminarCategoria = async (id: number) => {
    if (!confirm("¿Desea eliminar esta categoría de incidente?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/Incidente/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "No se pudo eliminar la categoría.");
      }

      alert("Categoría eliminada con éxito.");
      await cargarCategorias();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al eliminar.");
    }
  };

  return (
    <div className="gm-page">
      <div className="gm-header">
        <div>
          <span className="gm-tag">MUNICIPALIDAD DE MORÓN · ADMINISTRACIÓN</span>
          <h1 className="gm-title">Rubros y Categorías de Incidencias</h1>
          <p className="gm-subtitle">
            Gestione las tipologías de problemas urbanos disponibles para que los vecinos reporten (baches, alumbrado, poda, etc.).
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginTop: "24px" }}>
        {/* FORMULARIO AGREGAR CATEGORÍA */}
        <section style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "24px", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 16px", color: "#f8fafc", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={20} color="#38bdf8" /> Nueva Categoría
          </h3>

          <form onSubmit={handleCrearCategoria} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", marginBottom: "6px" }}>Nombre del Rubro</label>
              <input
                type="text"
                placeholder="Ej: Semáforos y Señalización"
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", color: "white", padding: "10px", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", marginBottom: "6px" }}>Descripción / Cuadrilla encargada</label>
              <textarea
                rows={3}
                placeholder="Ej: Intervenciones de mantenimiento de red semafórica y cartelería vial..."
                value={descCategoria}
                onChange={(e) => setDescCategoria(e.target.value)}
                style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", color: "white", padding: "10px", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>

            <button
              type="submit"
              disabled={creando}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: creando ? "wait" : "pointer",
                marginTop: "8px",
              }}
            >
              {creando ? "Guardando..." : "Guardar Categoría"}
            </button>
          </form>
        </section>

        {/* LISTADO DE CATEGORÍAS */}
        <section style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px", color: "#f8fafc", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={20} color="#22c55e" /> Categorías Habilitadas en el Sistema
          </h3>

          {cargando ? (
            <p style={{ color: "#94a3b8" }}>Cargando rubros...</p>
          ) : categorias.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No hay categorías registradas.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "15px" }}>{cat.nombre}</h4>
                    {cat.descripcion && (
                      <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>{cat.descripcion}</p>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "12px", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={12} /> Habilitado
                    </span>

                    <button
                      onClick={() => handleEliminarCategoria(cat.id)}
                      title="Eliminar categoría"
                      style={{ background: "#ef4444", border: "none", color: "white", padding: "6px 8px", borderRadius: "6px", cursor: "pointer" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
