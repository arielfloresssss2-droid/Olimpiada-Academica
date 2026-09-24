namespace Backend.Models;

public class ApoyoReporte
{
    public int IdReporte { get; set; }
    public int IdUsuario { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public Reporte? Reporte { get; set; }
    public Usuario? Usuario { get; set; }
}
