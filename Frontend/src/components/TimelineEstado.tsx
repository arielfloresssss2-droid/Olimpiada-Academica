import React from "react";

interface TimelineEstadoProps {
  estadoActual: string;
}

const pasosTimeline = [
  { clave: "Pendiente", label: "Pendiente", icono: "⏳" },
  { clave: "En revisión", label: "En revisión", icono: "📋" },
  { clave: "En proceso", label: "En proceso", icono: "🛠️" },
  { clave: "Resuelto", label: "Resuelto / Rechazado", icono: "✅" },
];

export default function TimelineEstado({ estadoActual }: TimelineEstadoProps) {
  // Mapear nombres de estados que vengan del backend a nuestro timeline
  const normalizarEstado = (est: string) => {
    const e = (est || "").toLowerCase();
    if (e.includes("pendiente")) return 0;
    if (e.includes("aceptado") || e.includes("revisión") || e.includes("revision")) return 1;
    if (e.includes("preparando") || e.includes("proceso")) return 2;
    if (e.includes("listo") || e.includes("entregado") || e.includes("resuelto")) return 3;
    if (e.includes("cancelado") || e.includes("rechazado")) return 3;
    return 0;
  };

  const indiceActual = normalizarEstado(estadoActual);
  const esRechazado = estadoActual.toLowerCase().includes("cancelado") || estadoActual.toLowerCase().includes("rechazado");

  return (
    <div style={{ width: "100%", margin: "16px 0", background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⏱️ Timeline de seguimiento</span>
        </h4>
        <span style={{ fontSize: "12px", color: esRechazado ? "#f87171" : "#38bdf8", background: "#1e293b", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>
          Estado actual: {estadoActual}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {pasosTimeline.map((paso, idx) => {
          const completado = idx <= indiceActual;
          const esElActual = idx === indiceActual;

          return (
            <React.Fragment key={paso.clave}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: completado
                      ? (esRechazado && idx === 3 ? "#ef4444" : "#22c55e")
                      : "#334155",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    boxShadow: esElActual ? "0 0 12px #38bdf8" : "none",
                    border: esElActual ? "2px solid #38bdf8" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {esRechazado && idx === 3 ? "❌" : paso.icono}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    marginTop: "8px",
                    color: completado ? "#f8fafc" : "#64748b",
                    fontWeight: esElActual ? 700 : 400,
                    textAlign: "center",
                  }}
                >
                  {paso.label}
                </span>
              </div>

              {idx < pasosTimeline.length - 1 && (
                <div
                  style={{
                    height: "4px",
                    flex: 1,
                    background: idx < indiceActual ? "#22c55e" : "#334155",
                    marginTop: "-20px",
                    transition: "all 0.3s ease",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
