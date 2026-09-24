namespace Backend.Services;

public class ReporteCercanoDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Estado { get; set; }
    public double DistanciaMetros { get; set; }
}

public class ResultadoModeracion
{
    public bool EsDuplicadoPotencial { get; set; }
    public string MensajeIA { get; set; } = string.Empty;
    public List<ReporteCercanoDto> ReportesSimilares { get; set; } = new();
}

public interface IGeminiService
{
    Task<ResultadoModeracion> AnalizarDuplicado(
        string tituloNuevo,
        string? descripcionNueva,
        List<ReporteCercanoDto> reportesCercanos
    );
}
