namespace Backend.Models;

public class Estado
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;

    public ICollection<Reporte> Reportes { get; set; } = new List<Reporte>();
}
