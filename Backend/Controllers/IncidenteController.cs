using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidenteController : ControllerBase
{
    private readonly AppDbContext _context;

    public IncidenteController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtener todas las categorías y rubros de incidentes municipales (Vía pública, Luminaria, Bache, etc.).
    /// Acceso público.
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetIncidentes()
    {
        var incidentes = await _context.Incidentes
            .OrderBy(i => i.Nombre)
            .Select(i => new
            {
                i.Id,
                i.Nombre,
                i.Descripcion,
                TotalReportes = i.Reportes.Count
            })
            .ToListAsync();

        return Ok(incidentes);
    }

    /// <summary>
    /// Crear una nueva categoría de incidente municipal.
    /// Requiere perfil administrativo / municipal.
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CrearIncidente([FromBody] CrearIncidenteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            return BadRequest("El nombre de la categoría de incidencia es requerido.");

        var nombreNormalizado = dto.Nombre.Trim();
        var existe = await _context.Incidentes
            .AnyAsync(i => i.Nombre.ToLower() == nombreNormalizado.ToLower());

        if (existe)
            return Conflict($"Ya existe una categoría de incidente con el nombre '{nombreNormalizado}'.");

        var incidente = new Incidente
        {
            Nombre = nombreNormalizado,
            Descripcion = dto.Descripcion?.Trim()
        };

        _context.Incidentes.Add(incidente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncidentes), new { id = incidente.Id }, new
        {
            incidente.Id,
            incidente.Nombre,
            incidente.Descripcion,
            mensaje = "Categoría de incidencia creada exitosamente."
        });
    }

    /// <summary>
    /// Eliminar una categoría de incidente si no posee reportes ciudadanos asociados.
    /// </summary>
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarIncidente(int id)
    {
        var incidente = await _context.Incidentes.FindAsync(id);
        if (incidente == null)
            return NotFound("Categoría de incidente no encontrada.");

        var tieneReportes = await _context.Reportes.AnyAsync(r => r.IdIncidente == id);
        if (tieneReportes)
            return BadRequest("No se puede eliminar la categoría porque ya tiene reportes ciudadanos asociados.");

        _context.Incidentes.Remove(incidente);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = $"Categoría '{incidente.Nombre}' eliminada exitosamente." });
    }
}

public class CrearIncidenteDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}
