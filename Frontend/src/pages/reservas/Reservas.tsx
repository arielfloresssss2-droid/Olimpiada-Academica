import { useState } from "react";
import "../../styles/reservas/Reservas.css";
import MapaIncidente from "../../components/MapaIncidente";
import Captcha from "../../components/Captcha";

interface ReservasProps {
  setActiveSection: (section: string) => void;
}

interface CategoriaIncidente {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  tiempoResolucion: string;
}

const categorias: CategoriaIncidente[] = [
  { id: "bache", nombre: "Bache / Asfalto", icono: "🕳️", descripcion: "Pozo o rotura en la calzada", tiempoResolucion: "24-48 hs" },
  { id: "luminaria", nombre: "Alumbrado Público", icono: "💡", descripcion: "Luminaria apagada o en corto", tiempoResolucion: "24-48 hs" },
  { id: "basura", nombre: "Higiene / Basura", icono: "🗑️", descripcion: "Acumulación de residuos o microbasural", tiempoResolucion: "24 hs" },
  { id: "semaforo", nombre: "Semáforo / Vial", icono: "🚦", descripcion: "Semáforo descompuesto o señal rota", tiempoResolucion: "12-24 hs" },
  { id: "poda", nombre: "Poda / Arbolado", icono: "🌳", descripcion: "Ramas caídas o interferencia de cables", tiempoResolucion: "48-72 hs" },
  { id: "agua", nombre: "Agua / Cloacas", icono: "💧", descripcion: "Pérdida de agua potable o desborde", tiempoResolucion: "24 hs" },
];

const barriosMoron = [
  "Morón Centro",
  "Castelar",
  "Haedo",
  "El Palomar",
  "Villa Sarmiento",
];

export default function Reservar({ setActiveSection }: ReservasProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("bache");
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<string>("Morón Centro");
  const [titulo, setTitulo] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [direccionManual, setDireccionManual] = useState<string>("");
  const [latitud, setLatitud] = useState<number>(-34.6508);
  const [longitud, setLongitud] = useState<number>(-58.6214);
  const [fotoNombre, setFotoNombre] = useState<string>("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

  const manejarUbicacionMapa = (lat: number, lng: number, dirTexto: string) => {
    setLatitud(lat);
    setLongitud(lng);
    setDireccionManual(dirTexto);
  };

  const manejarFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoNombre(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmarIncidencia = () => {
    if (!titulo.trim() || !descripcion.trim()) {
      alert("Por favor completá el título y la descripción del incidente.");
      return;
    }

    if (!captchaVerified) {
      alert("Por favor completá la verificación de seguridad (Captcha) para proteger el sistema.");
      return;
    }

    const usuarioRaw = localStorage.getItem("usuario");
    if (!usuarioRaw) {
      alert("Debés iniciar sesión para reportar un incidente.");
      return;
    }

    const catObj = categorias.find((c) => c.id === categoriaSeleccionada);

    const datosReporte = [
      {
        id: Date.now(),
        nombre: `${catObj?.icono || "⚠️"} ${titulo}`,
        descripcion: `${descripcion} | Barrio: ${barrioSeleccionado} | Ubicación: ${direccionManual || "Coordenadas seleccionadas"}`,
        precio: 0,
        tipo: "producto",
        foto: fotoNombre || null,
        lat: latitud,
        lng: longitud,
        barrio: barrioSeleccionado,
        categoria: catObj?.nombre || "Incidencia general",
      },
    ];

    localStorage.setItem("carrito", JSON.stringify(datosReporte));
    setActiveSection("confirmar-pedido");
  };

  const catActual = categorias.find((c) => c.id === categoriaSeleccionada);

  return (
    <section className="reservar-section">
      <div className="reservar-header">
        <h2>📍 Reportar Incidencia Urbana en Morón</h2>
        <span>
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {/* SELECCIÓN DE CATEGORÍAS CON ÍCONOS */}
      <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px", color: "#f8fafc", fontSize: "16px" }}>1. Seleccioná la Categoría de la Incidencia</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {categorias.map((cat) => {
            const esSeleccionada = cat.id === categoriaSeleccionada;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaSeleccionada(cat.id)}
                style={{
                  background: esSeleccionada ? "#1e293b" : "#020617",
                  border: esSeleccionada ? "2px solid #ef4444" : "1px solid #334155",
                  borderRadius: "10px",
                  padding: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: esSeleccionada ? "0 0 12px rgba(239, 68, 68, 0.4)" : "none",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>{cat.icono}</div>
                <strong style={{ color: "#f8fafc", display: "block", fontSize: "14px" }}>{cat.nombre}</strong>
                <span style={{ color: "#94a3b8", fontSize: "12px", display: "block", marginTop: "4px" }}>{cat.descripcion}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAPA INTERACTIVO LEAFLET + OPENSTREETMAP */}
      <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "16px" }}>2. Marcá la Ubicación en el Mapa Interactivo</h3>
          <span style={{ fontSize: "12px", color: "#38bdf8", background: "#1e293b", padding: "4px 8px", borderRadius: "6px" }}>
            Leaflet + OpenStreetMap
          </span>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: 0, marginBottom: "16px" }}>
          Marcá dónde está la incidencia en el mapa en vez de escribir la dirección a mano.
        </p>

        <MapaIncidente
          latSeleccionada={latitud}
          lngSeleccionada={longitud}
          onUbicacionSeleccionada={manejarUbicacionMapa}
          height="350px"
        />

        <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ color: "#cbd5e1", fontSize: "13px", display: "block", marginBottom: "4px" }}>Barrio / Localidad de Morón</label>
            <select
              value={barrioSeleccionado}
              onChange={(e) => setBarrioSeleccionado(e.target.value)}
              style={{
                width: "100%",
                background: "#1e293b",
                color: "white",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
              }}
            >
              {barriosMoron.map((barrio) => (
                <option key={barrio} value={barrio}>
                  {barrio}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: "#cbd5e1", fontSize: "13px", display: "block", marginBottom: "4px" }}>Ubicación Seleccionada / Dirección</label>
            <input
              type="text"
              readOnly
              value={direccionManual || `Coordenadas: ${latitud.toFixed(4)}, ${longitud.toFixed(4)}`}
              style={{
                width: "100%",
                background: "#1e293b",
                color: "#38bdf8",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            />
          </div>
        </div>
      </div>

      {/* FORMULARIO DE DETALLES Y FOTO DE EVIDENCIA */}
      <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px", color: "#f8fafc", fontSize: "16px" }}>3. Detalle de la Incidencia y Foto Evidencia</h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ color: "#cbd5e1", fontSize: "13px", display: "block", marginBottom: "6px" }}>Título breve del problema</label>
          <input
            type="text"
            placeholder="Ej: Bache profundo frente a parada de colectivo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{
              width: "100%",
              background: "#1e293b",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ color: "#cbd5e1", fontSize: "13px", display: "block", marginBottom: "6px" }}>Descripción detallada</label>
          <textarea
            rows={4}
            placeholder="Explicá el problema para guiar a la cuadrilla municipal..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{
              width: "100%",
              background: "#1e293b",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* ADJUNTAR FOTO COMO EVIDENCIA */}
        <div style={{ background: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px stroke #334155" }}>
          <label style={{ color: "#f8fafc", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", cursor: "pointer" }}>
            <span>📸 Adjuntar Foto como Evidencia</span>
          </label>
          <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 12px" }}>
            Subí una imagen clara del problema para agilizar la inspección del área municipal.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={manejarFotoChange}
            style={{ color: "#cbd5e1", fontSize: "13px" }}
          />

          {fotoPreview && (
            <div style={{ marginTop: "12px" }}>
              <img
                src={fotoPreview}
                alt="Evidencia cargada"
                style={{ maxHeight: "160px", borderRadius: "8px", border: "2px solid #22c55e" }}
              />
              <span style={{ display: "block", fontSize: "12px", color: "#22c55e", marginTop: "4px" }}>
                ✓ Foto cargada: {fotoNombre}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* VERIFICACIÓN ANTI-SPAM / CAPTCHA */}
      <div style={{ marginBottom: "20px" }}>
        <Captcha onVerify={setCaptchaVerified} title="Verificación Anti-Spam para Envío de Reporte" />
      </div>

      {/* BOTÓN FINAL DE CONFIRMACIÓN */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
        <div>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Categoría: </span>
          <strong style={{ color: "#f8fafc" }}>{catActual?.icono} {catActual?.nombre}</strong>
          <span style={{ color: "#38bdf8", marginLeft: "12px", fontSize: "12px" }}>Tiempo estimado: {catActual?.tiempoResolucion}</span>
        </div>

        <button
          type="button"
          onClick={confirmarIncidencia}
          disabled={!captchaVerified}
          style={{
            background: captchaVerified ? "#ef4444" : "#64748b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: captchaVerified ? "pointer" : "not-allowed",
            boxShadow: captchaVerified ? "0 4px 14px rgba(239, 68, 68, 0.4)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Enviar Reporte de Incidencia ➔
        </button>
      </div>
    </section>
  );
}