namespace Backend.DTOs.Reportes;

public class ReporteDetalleDto : ReporteDto
{
    public List<RespuestaItemDto> Respuestas { get; set; } = new();
    public List<ArchivoItemDto> Archivos { get; set; } = new();
    public List<HistorialItemDto> Historial { get; set; } = new();
}

public class RespuestaItemDto
{
    public int Id { get; set; }
    public int IdUser { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string Comentario { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}

public class ArchivoItemDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? Tipo { get; set; }
    public string? NombreOriginal { get; set; }
    public DateTime FechaSubida { get; set; }
}

public class HistorialItemDto
{
    public int Id { get; set; }
    public int IdUser { get; set; }
    public string? UsuarioNombre { get; set; }
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
