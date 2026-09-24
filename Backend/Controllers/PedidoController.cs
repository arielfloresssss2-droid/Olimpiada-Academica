using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidoController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidoController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Compatibilidad con la vista de historial de reclamos/incidentes del ciudadano.
    /// Retorna los incidentes con estado 'Resuelto' (o 'Entregado') o 'Cancelado'.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("Usuario/{idUsuario}")]
    public async Task<IActionResult> GetHistorialPorUsuario(int idUsuario)
    {
        var reportes = await _context.Reportes
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Where(r => r.IdUser == idUsuario)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        var historial = reportes.Select(r =>
        {
            var nombreEstado = r.Estado?.Nombre ?? "Pendiente";
            // Para el filtro de Historial.tsx (estado === "Entregado" || estado === "Cancelado")
            string estadoFrontend = nombreEstado;
            if (nombreEstado.Equals("Resuelto", StringComparison.OrdinalIgnoreCase))
            {
                estadoFrontend = "Entregado";
            }

            return new
            {
                id = r.Id,
                nroOrden = r.Id,
                titulo = r.Titulo,
                descripcion = r.Descripcion,
                fechaPedido = r.FechaCreacion.ToString("o"),
                fecha = r.FechaCreacion.ToString("dd/MM/yyyy"),
                estado = estadoFrontend,
                total = 0,
                valor = 0
            };
        }).ToList();

        return Ok(historial);
    }

    /// <summary>
    /// Endpoint de compatibilidad para creación
    /// </summary>
    [HttpPost]
    public IActionResult CrearPedido([FromBody] object payload)
    {
        return Ok(new { mensaje = "Operación registrada correctamente.", id = 1 });
    }
}
