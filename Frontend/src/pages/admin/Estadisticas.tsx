import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Ban,
  FileSpreadsheet,
  FileText,
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

const datosBarrio = [
  { barrio: "Morón Centro", incidentes: 45 },
  { barrio: "Castelar", incidentes: 32 },
  { barrio: "Haedo", incidentes: 24 },
  { barrio: "El Palomar", incidentes: 18 },
  { barrio: "Villa Sarmiento", incidentes: 15 },
];

const datosCategoria = [
  { name: "Baches", value: 38, color: "#ef4444" },
  { name: "Luminarias", value: 28, color: "#f59e0b" },
  { name: "Basura / Higiene", value: 22, color: "#10b981" },
  { name: "Semáforos", value: 14, color: "#8b5cf6" },
  { name: "Poda / Árboles", value: 18, color: "#06b6d4" },
];

export default function Estadisticas() {
  const exportarCSV = () => {
    const encabezados = "Barrio,Categoria,Incidentes,TiempoPromedioResolucion\n";
    const filas = [
      "Morón Centro,Baches,45,24 hs",
      "Castelar,Luminarias,32,36 hs",
      "Haedo,Basura,24,18 hs",
      "El Palomar,Poda,18,48 hs",
      "Villa Sarmiento,Semáforos,15,12 hs",
    ].join("\n");

    const blob = new Blob([encabezados + filas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Estadisticas_Incidentes_Moron.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    alert("📑 Generando informe PDF consolidado de incidentes municipales Morón...");
    window.print();
  };

  return (
    <section className="estadisticas-home">
      <header className="estadisticas-header">
        <div>
          <span className="estadisticas-tag">Municipalidad de Morón</span>
          <h1>Estadísticas e Informes de Incidentes</h1>
          <p>
            Análisis gráfico por barrio, categoría y tiempo promedio de resolución.
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
            <FileText size={18} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* TARJETAS RESUMEN DE MÉTRICAS */}
      <div className="estadisticas-resumen">
        <article className="estadistica-card">
          <div className="estadistica-icon">
            <CalendarDays size={34} />
          </div>
          <span>Reportes HOY</span>
          <h2>34</h2>
          <small>Incidentes registrados hoy</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <CheckCircle2 size={34} />
          </div>
          <span>Resueltos HOY</span>
          <h2 style={{ color: "#22c55e" }}>28</h2>
          <small>Intervenciones finalizadas</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <Clock size={34} />
          </div>
          <span>Tiempo Prom. Resolución</span>
          <h3>26.4 hs</h3>
          <small>Promedio cuadrillas Morón</small>
        </article>

        <article className="estadistica-card">
          <div className="estadistica-icon">
            <Ban size={34} />
          </div>
          <span>Desestimados</span>
          <h2 className="danger">3</h2>
          <small>Reportes duplicados/desestimados</small>
        </article>
      </div>

      {/* GRÁFICO 1: INCIDENTES POR BARRIO */}
      <section className="grafico-card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          <h3>📊 Incidencias por Barrio de Morón</h3>
          <p>
            Distribución geográfica de reclamos ciudadanos por localidad.
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
            Tipología de reclamos recibidos en la plataforma.
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
