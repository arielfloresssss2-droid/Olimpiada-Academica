import { useState } from "react";

export interface LogEntry {
  id: number;
  reporteId: number;
  tituloReporte: string;
  usuarioResponsable: string;
  rolUsuario: string;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaHora: string;
  detalles?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 1,
    reporteId: 104,
    tituloReporte: "Bache profundo en Av. Rivadavia 14200",
    usuarioResponsable: "Carlos Gómez (Empleado Municipal)",
    rolUsuario: "Empleado Municipal",
    estadoAnterior: "Pendiente",
    estadoNuevo: "En revisión",
    fechaHora: new Date(Date.now() - 3600000 * 5).toLocaleString("es-AR"),
    detalles: "Asignado a la Cuadrilla Vía Pública Morón Centro",
  },
  {
    id: 2,
    reporteId: 102,
    tituloReporte: "Luminaria apagada en Plaza San Martín",
    usuarioResponsable: "Admin Sistema Morón",
    rolUsuario: "Admin",
    estadoAnterior: "En revisión",
    estadoNuevo: "En proceso",
    fechaHora: new Date(Date.now() - 3600000 * 24).toLocaleString("es-AR"),
    detalles: "Repuesto de lámpara LED programado",
  },
  {
    id: 3,
    reporteId: 99,
    tituloReporte: "Basura acumulada en esquina Arias y San Martín",
    usuarioResponsable: "María Fernández (Empleado Municipal)",
    rolUsuario: "Empleado Municipal",
    estadoAnterior: "En proceso",
    estadoNuevo: "Resuelto",
    fechaHora: new Date(Date.now() - 3600000 * 48).toLocaleString("es-AR"),
    detalles: "Limpieza realizada por camión recolector #4",
  },
];

interface LogAuditoriaProps {
  logsAdicionales?: LogEntry[];
}

export default function LogAuditoria({ logsAdicionales = [] }: LogAuditoriaProps) {
  const todosLosLogs = [...logsAdicionales, ...mockLogs];
  const [filtro, setFiltro] = useState("");

  const logsFiltrados = todosLosLogs.filter((log) =>
    log.tituloReporte.toLowerCase().includes(filtro.toLowerCase()) ||
    log.usuarioResponsable.toLowerCase().includes(filtro.toLowerCase()) ||
    log.estadoNuevo.toLowerCase().includes(filtro.toLowerCase()) ||
    String(log.reporteId).includes(filtro)
  );

  return (
    <div style={{ background: "#0f172a", borderRadius: "12px", padding: "20px", border: "1px solid #1e293b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>📝 Log de Auditoría y Seguridad</h3>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
            Histórico inmutable de modificaciones de estado y acciones con trazabilidad basada en JWT
          </p>
        </div>

        <input
          type="text"
          placeholder="🔍 Buscar por ticket, usuario o estado..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            background: "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            width: "280px",
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#e2e8f0", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#1e293b", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", borderRadius: "6px 0 0 6px" }}>Ticket</th>
              <th style={{ padding: "10px 12px" }}>Incidencia</th>
              <th style={{ padding: "10px 12px" }}>Usuario Responsable</th>
              <th style={{ padding: "10px 12px" }}>Cambio de Estado</th>
              <th style={{ padding: "10px 12px", borderRadius: "0 6px 6px 0" }}>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "12px", fontWeight: 700, color: "#38bdf8" }}>#{log.reporteId}</td>
                <td style={{ padding: "12px" }}>{log.tituloReporte}</td>
                <td style={{ padding: "12px" }}>
                  <div>{log.usuarioResponsable}</div>
                  <span style={{ fontSize: "11px", background: "#334155", padding: "2px 6px", borderRadius: "4px", color: "#cbd5e1" }}>
                    {log.rolUsuario}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  <span style={{ color: "#94a3b8" }}>{log.estadoAnterior}</span>
                  <span style={{ margin: "0 6px", color: "#38bdf8" }}>➔</span>
                  <span style={{ fontWeight: 600, color: "#22c55e" }}>{log.estadoNuevo}</span>
                </td>
                <td style={{ padding: "12px", color: "#94a3b8" }}>{log.fechaHora}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
