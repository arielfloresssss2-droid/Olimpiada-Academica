import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Ban,
  FileSpreadsheet,
  FileText,
  RotateCcw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_BASE_URL } from "../../config/api";

interface EstadisticasApi {
  totalReportes: number;
  resueltos: number;
  enProceso: number;
  pendientes: number;
  porBarrio: { barrio: string; incidentes: number }[];
  porCategoria: { name: string; value: number; color: string }[];
  tiempoPromedioResolucionHoras: number;
}

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasApi | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/api/Reportes/estadisticas`);
      if (res.ok) {
        const data = await res.json();
        setEstadisticas(data);
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const exportarCSV = () => {
    if (!estadisticas) return;
    const encabezados = "Categoria,Cantidad\n";
    const filasCat = estadisticas.porCategoria.map((c) => `"${c.name}",${c.value}`).join("\n");
    const filasBarrio = "\n\nBarrio,Incidentes\n" + estadisticas.porBarrio.map((b) => `"${b.barrio}",${b.incidentes}`).join("\n");

    const blob = new Blob([encabezados + filasCat + filasBarrio], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Estadisticas_Incidentes_Moron.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    alert("📑 Generando informe PDF de estadísticas de Morón...");
    window.print();
  };

  const datosBarrio = estadisticas?.porBarrio && estadisticas.porBarrio.length > 0
    ? estadisticas.porBarrio
    : [
        { barrio: "Morón Centro", incidentes: 0 },
        { barrio: "Castelar", incidentes: 0 },
        { barrio: "Haedo", incidentes: 0 },
      ];

  const datosCategoria = estadisticas?.porCategoria && estadisticas.porCategoria.length > 0
    ? estadisticas.porCategoria
    : [
        { name: "Sin incidencias", value: 1, color: "#64748b" },
      ];

  return (
    <section className="estadisticas-home">
      <header className="estadisticas-header">
        <div>
          <span className="estadisticas-tag">Municipalidad de Morón</span>
          <h1>Estadísticas e Informes de Incidentes</h1>
          <p>
            Métricas oficiales en tiempo real agrupadas por barrio, tipología y tiempo promedio de resolución.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="btn-exportar-excel"
            onClick={exportarCSV}
            style={{ background: "#10b981", color: "white" }}
          >
            <FileSpreadsheet size={18} /> Exportar CSV
          </button>

          <button
            className="btn-exportar-excel"
            onClick={exportarPDF}
            style={{ background: "#ef4444", color: "white" }}
          >
            <FileText size={18} /> Imprimir / PDF
          </button>

          <button
            className="btn-exportar-excel"
            onClick={cargarEstadisticas}
            style={{ background: "#3b82f6", color: "white" }}
          >
            <RotateCcw size={18} /> Actualizar
          </button>
        </div>
      </header>

      {/* TARJETAS RESUMEN DE MÉTRICAS REALES */}
      <div className="estadisticas-resumen">
        <article className="estadistica-card">
          <div className="estadistica-icon">
            <CalendarDays size={34} />
          </div>
          <span>Total Reportes</span>
          <h2>{cargando ? "..." : estadisticas?.totalReportes ?? 0}</h2>
          <small>Incidentes registrados en el sistema</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <CheckCircle2 size={34} />
          </div>
          <span>Resueltos</span>
          <h2 style={{ color: "#22c55e" }}>{cargando ? "..." : estadisticas?.resueltos ?? 0}</h2>
          <small>Intervenciones finalizadas</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <Clock size={34} />
          </div>
          <span>Tiempo Prom. Resolución</span>
          <h3>{cargando ? "..." : `${estadisticas?.tiempoPromedioResolucionHoras ?? 24} hs`}</h3>
          <small>Promedio cuadrillas Morón</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <Ban size={34} />
          </div>
          <span>En Proceso / Pendientes</span>
          <h2 className="danger">{cargando ? "..." : (estadisticas?.enProceso ?? 0) + (estadisticas?.pendientes ?? 0)}</h2>
          <small>Reclamos en curso de cuadrilla</small>
        </article>
      </div>

      {/* GRÁFICO 1: INCIDENTES POR BARRIO */}
      <section className="grafico-card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <h3>📊 Incidencias por Barrio de Morón (LINQ GroupBy)</h3>
          <p>
            Distribución geográfica real de reclamos ciudadanos según registros de la base de datos.
          </p>
        </div>

        <div className="grafico-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosBarrio}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#CBD5E1" dataKey="barrio" />
              <YAxis stroke="#CBD5E1" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="incidentes" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* GRÁFICO 2: INCIDENTES POR TIPO DE CATEGORÍA */}
      <section className="grafico-card">
        <div className="card-title">
          <h3>🏷️ Incidencias por Categoría (Baches, Alumbrado, Higiene, etc.)</h3>
          <p>
            Proporción de tipologías reportadas por los vecinos.
          </p>
        </div>

        <div className="grafico-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosCategoria}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {datosCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#38bdf8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
}
