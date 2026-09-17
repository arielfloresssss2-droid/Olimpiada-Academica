namespace Backend.Models;

public class ArchivoAdjunto
{
    public int Id { get; set; }
    public int IdReporte { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? Tipo { get; set; }
    public string? NombreOriginal { get; set; }
    public DateTime FechaSubida { get; set; } = DateTime.UtcNow;

    public Reporte? Reporte { get; set; }
}
