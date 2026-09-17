namespace Backend.Models;

public class Municipio
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? DireccionOficina { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
