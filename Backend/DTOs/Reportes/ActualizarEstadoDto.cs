namespace Backend.DTOs.Reportes;

public class ActualizarEstadoDto
{
    public string NuevoEstado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
}
