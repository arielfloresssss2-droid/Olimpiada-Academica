using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtener todos los reportes de incidentes.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReportes()
    {
        var reportes = await _context.Reportes
            .Include(r => r.Usuario)
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Include(r => r.FechaRef)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        return Ok(reportes);
    }

    /// <summary>
    /// Obtener un reporte por ID con sus respuestas y adjuntos.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReporte(int id)
    {
        var reporte = await _context.Reportes
            .Include(r => r.Usuario)
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Include(r => r.FechaRef)
            .Include(r => r.Respuestas)
                .ThenInclude(resp => resp.Usuario)
            .Include(r => r.Archivos)
            .Include(r => r.Historiales)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
            return NotFound("Reporte no encontrado.");

        return Ok(reporte);
    }

    /// <summary>
    /// Obtener reportes creados por un usuario específico.
    /// </summary>
    [HttpGet("usuario/{idUsuario}")]
    public async Task<IActionResult> GetReportesByUsuario(int idUsuario)
    {
        var reportes = await _context.Reportes
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Where(r => r.IdUser == idUsuario)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        return Ok(reportes);
    }
}
