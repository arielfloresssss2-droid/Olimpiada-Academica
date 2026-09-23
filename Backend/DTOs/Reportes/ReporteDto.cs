namespace Backend.DTOs.Reportes;

public class ReporteDto
{
    public int Id { get; set; }
    public int IdUser { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioEmail { get; set; } = string.Empty;
    public int IdEstado { get; set; }
    public string EstadoNombre { get; set; } = string.Empty;
    public int IdIncidente { get; set; }
    public string IncidenteNombre { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Prioridad { get; set; }
    public string? Hora { get; set; }
    public DateTime FechaCreacion { get; set; }

    // Ubicación
    public string? DireccionTexto { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }

    // Fechas
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }

    // Resumen
    public int TotalRespuestas { get; set; }
    public int TotalArchivos { get; set; }
}
