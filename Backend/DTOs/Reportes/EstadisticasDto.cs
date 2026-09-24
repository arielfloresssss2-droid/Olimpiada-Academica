namespace Backend.DTOs.Reportes;

public class EstadisticasDto
{
    public int TotalReportes { get; set; }
    public int Resueltos { get; set; }
    public int EnProceso { get; set; }
    public int Pendientes { get; set; }
    public List<EstadisticaBarrioDto> PorBarrio { get; set; } = new();
    public List<EstadisticaCategoriaDto> PorCategoria { get; set; } = new();
    public double TiempoPromedioResolucionHoras { get; set; }
}

public class EstadisticaBarrioDto
{
    public string Barrio { get; set; } = string.Empty;
    public int Incidentes { get; set; }
}

public class EstadisticaCategoriaDto
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
    public string Color { get; set; } = "#38bdf8";
}
