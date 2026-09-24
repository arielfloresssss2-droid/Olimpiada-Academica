import { AlertTriangle, ThumbsUp, Send, X, MapPin } from "lucide-react";

export interface ReporteSimilar {
  id: number;
  titulo: string;
  descripcion?: string;
  estado?: string;
  distanciaMetros: number;
}

interface ModalDuplicadoIAProps {
  isOpen: boolean;
  mensajeIA: string;
  reportesSimilares: ReporteSimilar[];
  onApoyarExistente: (reporteId: number) => void;
  onForzarCreacion: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export default function ModalDuplicadoIA({
  isOpen,
  mensajeIA,
  reportesSimilares,
  onApoyarExistente,
  onForzarCreacion,
  onCancelar,
  cargando = false,
}: ModalDuplicadoIAProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(2, 6, 23, 0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #38bdf8",
          borderRadius: "16px",
          maxWidth: "560px",
          width: "100%",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.2)",
          color: "#f8fafc",
          position: "relative",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Cabecera */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              background: "#0369a1",
              color: "#38bdf8",
              padding: "10px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={26} color="#38bdf8" />
          </div>

          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#38bdf8",
                textTransform: "uppercase",
                background: "rgba(56, 189, 248, 0.15)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              🤖 Moderación Inteligente Gemini
            </span>
            <h3 style={{ margin: "6px 0 0", fontSize: "18px", color: "#f8fafc" }}>
              ¿Es el mismo incidente?
            </h3>
          </div>

          <button
            onClick={onCancelar}
            disabled={cargando}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje de la IA */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            border: "1px solid #334155",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "16px",
            fontSize: "14px",
            lineHeight: 1.5,
            color: "#e2e8f0",
          }}
        >
          {mensajeIA ||
            "Detectamos que ya existe un reporte muy similar a menos de 50 metros del lugar indicado."}
        </div>

        {/* Lista de reportes similares cercanos */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
            Incidencia(s) cercana(s) registrada(s):
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", maxHeight: "180px", overflowY: "auto" }}>
            {reportesSimilares.map((rep) => (
              <div
                key={rep.id}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      #{rep.id} - {rep.titulo}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#0284c7",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <MapPin size={10} style={{ display: "inline", marginRight: "2px" }} />
                      a {rep.distanciaMetros.toFixed(0)}m
                    </span>
                  </div>

                  {rep.descripcion && (
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {rep.descripcion}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onApoyarExistente(rep.id)}
                  disabled={cargando}
                  style={{
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: cargando ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ThumbsUp size={14} />
                  Apoyar este
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #1e293b" }}>
          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            style={{
              background: "transparent",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Modificar mi reporte
          </button>

          <button
            type="button"
            onClick={onForzarCreacion}
            disabled={cargando}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: cargando ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Send size={14} />
            {cargando ? "Enviando..." : "No, es distinto (crear de todas formas)"}
          </button>
        </div>
      </div>
    </div>
  );
}
