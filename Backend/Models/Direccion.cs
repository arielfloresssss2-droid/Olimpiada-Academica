namespace Backend.Models;

public class Direccion
{
    public int Id { get; set; }
    public string DireccionTexto { get; set; } = string.Empty;
    public decimal? Longitud { get; set; }
    public decimal? Latitud { get; set; }

    public ICollection<Reporte> Reportes { get; set; } = new List<Reporte>();
}
