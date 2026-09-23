namespace Backend.Models;

public class Usuario
{
    public int Id { get; set; }
    public int? IdMun { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string Rol { get; set; } = "Ciudadano";
    public bool Activo { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Municipio? Municipio { get; set; }
    public ICollection<Reporte> Reportes { get; set; } = new List<Reporte>();
    public ICollection<Respuesta> Respuestas { get; set; } = new List<Respuesta>();
    public ICollection<HistorialEstado> Historiales { get; set; } = new List<HistorialEstado>();
}
