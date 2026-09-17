namespace Backend.Models;

public class Fecha
{
    public int Id { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }

    public ICollection<Reporte> Reportes { get; set; } = new List<Reporte>();
}
