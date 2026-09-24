namespace Backend.DTOs.Incidente;

public class IncidenteDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class CrearIncidenteDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}
