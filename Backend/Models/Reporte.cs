namespace Backend.Models;

public class Reporte
{
    public int Id { get; set; }
    public int IdUser { get; set; }
    public int IdEstado { get; set; }
    public int? IdFecha { get; set; }
    public int IdIncidente { get; set; }
    public int? IdDireccion { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Hora { get; set; }
    public string? Prioridad { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Usuario? Usuario { get; set; }
    public Estado? Estado { get; set; }
    public Fecha? FechaRef { get; set; }
    public Incidente? Incidente { get; set; }
    public Direccion? DireccionRef { get; set; }

    public ICollection<Respuesta> Respuestas { get; set; } = new List<Respuesta>();
    public ICollection<ArchivoAdjunto> Archivos { get; set; } = new List<ArchivoAdjunto>();
    public ICollection<HistorialEstado> Historiales { get; set; } = new List<HistorialEstado>();
}
