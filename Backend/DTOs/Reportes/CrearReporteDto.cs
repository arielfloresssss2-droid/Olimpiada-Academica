namespace Backend.DTOs.Reportes;

public class CrearReporteDto
{
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int IdIncidente { get; set; }
    public string? Prioridad { get; set; }
    public string? Hora { get; set; }
    public string? DireccionTexto { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public DateTime? FechaInicio { get; set; }
    public bool ForzarCreacion { get; set; } = false;
}
