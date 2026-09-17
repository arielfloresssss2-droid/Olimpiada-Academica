namespace Backend.Models;

public class HistorialEstado
{
    public int Id { get; set; }
    public int IdReporte { get; set; }
    public int IdUser { get; set; }
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public Reporte? Reporte { get; set; }
    public Usuario? Usuario { get; set; }
}
