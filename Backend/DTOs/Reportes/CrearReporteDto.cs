namespace Backend.DTOs.Reportes;

public class CrearReporteDto
{
    public int IdUser { get; set; }
    public int IdIncidente { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Prioridad { get; set; } = "Media";
    public string? Hora { get; set; }

    // Datos de ubicación (se insertan en tabla 'direccion')
    public string? DireccionTexto { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }

    // Fechas asociadas (se insertan en tabla 'fechas')
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
}
