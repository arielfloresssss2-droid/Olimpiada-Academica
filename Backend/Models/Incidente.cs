namespace Backend.Models;

public class Incidente
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<Reporte> Reportes { get; set; } = new List<Reporte>();
}
