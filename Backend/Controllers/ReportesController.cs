using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs.Reportes;

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
    /// Obtener todos los reportes de incidentes con filtros opcionales.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReportes([FromQuery] int? idEstado, [FromQuery] int? idIncidente)
    {
        var query = _context.Reportes
            .Include(r => r.Usuario)
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Include(r => r.FechaRef)
            .Include(r => r.Respuestas)
            .Include(r => r.Archivos)
            .AsQueryable();

        if (idEstado.HasValue)
            query = query.Where(r => r.IdEstado == idEstado.Value);

        if (idIncidente.HasValue)
            query = query.Where(r => r.IdIncidente == idIncidente.Value);

        var reportes = await query
            .OrderByDescending(r => r.FechaCreacion)
            .Select(r => new ReporteDto
            {
                Id = r.Id,
                IdUser = r.IdUser,
                UsuarioNombre = r.Usuario != null ? $"{r.Usuario.Nombre} {r.Usuario.Apellido}".Trim() : string.Empty,
                UsuarioEmail = r.Usuario != null ? r.Usuario.Email : string.Empty,
                IdEstado = r.IdEstado,
                EstadoNombre = r.Estado != null ? r.Estado.Nombre : string.Empty,
                IdIncidente = r.IdIncidente,
                IncidenteNombre = r.Incidente != null ? r.Incidente.Nombre : string.Empty,
                Titulo = r.Titulo,
                Descripcion = r.Descripcion,
                Prioridad = r.Prioridad,
                Hora = r.Hora,
                FechaCreacion = r.FechaCreacion,
                DireccionTexto = r.DireccionRef != null ? r.DireccionRef.DireccionTexto : null,
                Latitud = r.DireccionRef != null ? r.DireccionRef.Latitud : null,
                Longitud = r.DireccionRef != null ? r.DireccionRef.Longitud : null,
                FechaInicio = r.FechaRef != null ? r.FechaRef.FechaInicio : null,
                FechaFin = r.FechaRef != null ? r.FechaRef.FechaFin : null,
                TotalRespuestas = r.Respuestas.Count,
                TotalArchivos = r.Archivos.Count
            })
            .ToListAsync();

        return Ok(reportes);
    }

    /// <summary>
    /// Obtener un reporte por ID con sus respuestas, adjuntos e historial de cambios de estado.
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
                .ThenInclude(h => h.Usuario)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
            return NotFound("Reporte no encontrado.");

        var dto = new ReporteDetalleDto
        {
            Id = reporte.Id,
            IdUser = reporte.IdUser,
            UsuarioNombre = reporte.Usuario != null ? $"{reporte.Usuario.Nombre} {reporte.Usuario.Apellido}".Trim() : string.Empty,
            UsuarioEmail = reporte.Usuario != null ? reporte.Usuario.Email : string.Empty,
            IdEstado = reporte.IdEstado,
            EstadoNombre = reporte.Estado != null ? reporte.Estado.Nombre : string.Empty,
            IdIncidente = reporte.IdIncidente,
            IncidenteNombre = reporte.Incidente != null ? reporte.Incidente.Nombre : string.Empty,
            Titulo = reporte.Titulo,
            Descripcion = reporte.Descripcion,
            Prioridad = reporte.Prioridad,
            Hora = reporte.Hora,
            FechaCreacion = reporte.FechaCreacion,
            DireccionTexto = reporte.DireccionRef?.DireccionTexto,
            Latitud = reporte.DireccionRef?.Latitud,
            Longitud = reporte.DireccionRef?.Longitud,
            FechaInicio = reporte.FechaRef?.FechaInicio,
            FechaFin = reporte.FechaRef?.FechaFin,
            TotalRespuestas = reporte.Respuestas.Count,
            TotalArchivos = reporte.Archivos.Count,
            Respuestas = reporte.Respuestas.Select(resp => new RespuestaItemDto
            {
                Id = resp.Id,
                IdUser = resp.IdUser,
                UsuarioNombre = resp.Usuario != null ? $"{resp.Usuario.Nombre} {resp.Usuario.Apellido}".Trim() : "Usuario",
                Comentario = resp.Comentario,
                Fecha = resp.Fecha
            }).OrderBy(r => r.Fecha).ToList(),
            Archivos = reporte.Archivos.Select(a => new ArchivoItemDto
            {
                Id = a.Id,
                Url = a.Url,
                Tipo = a.Tipo,
                NombreOriginal = a.NombreOriginal,
                FechaSubida = a.FechaSubida
            }).ToList(),
            Historial = reporte.Historiales.Select(h => new HistorialItemDto
            {
                Id = h.Id,
                IdUser = h.IdUser,
                UsuarioNombre = h.Usuario != null ? $"{h.Usuario.Nombre} {h.Usuario.Apellido}".Trim() : null,
                EstadoAnterior = h.EstadoAnterior,
                EstadoNuevo = h.EstadoNuevo,
                Fecha = h.Fecha
            }).OrderBy(h => h.Fecha).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Obtener reportes creados por un usuario específico.
    /// </summary>
    [HttpGet("usuario/{idUsuario}")]
    public async Task<IActionResult> GetReportesByUsuario(int idUsuario)
    {
        var reportes = await _context.Reportes
            .Include(r => r.Usuario)
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Include(r => r.FechaRef)
            .Include(r => r.Respuestas)
            .Include(r => r.Archivos)
            .Where(r => r.IdUser == idUsuario)
            .OrderByDescending(r => r.FechaCreacion)
            .Select(r => new ReporteDto
            {
                Id = r.Id,
                IdUser = r.IdUser,
                UsuarioNombre = r.Usuario != null ? $"{r.Usuario.Nombre} {r.Usuario.Apellido}".Trim() : string.Empty,
                UsuarioEmail = r.Usuario != null ? r.Usuario.Email : string.Empty,
                IdEstado = r.IdEstado,
                EstadoNombre = r.Estado != null ? r.Estado.Nombre : string.Empty,
                IdIncidente = r.IdIncidente,
                IncidenteNombre = r.Incidente != null ? r.Incidente.Nombre : string.Empty,
                Titulo = r.Titulo,
                Descripcion = r.Descripcion,
                Prioridad = r.Prioridad,
                Hora = r.Hora,
                FechaCreacion = r.FechaCreacion,
                DireccionTexto = r.DireccionRef != null ? r.DireccionRef.DireccionTexto : null,
                Latitud = r.DireccionRef != null ? r.DireccionRef.Latitud : null,
                Longitud = r.DireccionRef != null ? r.DireccionRef.Longitud : null,
                FechaInicio = r.FechaRef != null ? r.FechaRef.FechaInicio : null,
                FechaFin = r.FechaRef != null ? r.FechaRef.FechaFin : null,
                TotalRespuestas = r.Respuestas.Count,
                TotalArchivos = r.Archivos.Count
            })
            .ToListAsync();

        return Ok(reportes);
    }

    /// <summary>
    /// Registrar un nuevo reporte de incidente con dirección y fecha asociada.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CrearReporte([FromBody] CrearReporteDto request)
    {
        if (request.IdUser <= 0 || request.IdIncidente <= 0 || string.IsNullOrWhiteSpace(request.Titulo))
        {
            return BadRequest("El usuario, tipo de incidente y título son obligatorios.");
        }

        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == request.IdUser);
        if (!usuarioExiste)
        {
            return BadRequest("El usuario especificado no existe.");
        }

        var incidenteExiste = await _context.Incidentes.AnyAsync(i => i.Id == request.IdIncidente);
        if (!incidenteExiste)
        {
            return BadRequest("El tipo de incidente especificado no existe.");
        }

        // Obtener estado inicial (busca 'Pendiente' o el primer estado)
        var estadoInicial = await _context.Estados.FirstOrDefaultAsync(e => e.Nombre.ToLower() == "pendiente")
            ?? await _context.Estados.FirstOrDefaultAsync();

        if (estadoInicial == null)
        {
            return StatusCode(500, "No hay estados configurados en el sistema.");
        }

        // Crear registro en tabla 'direccion' si se especificaron datos geográficos
        int? idDireccion = null;
        if (!string.IsNullOrWhiteSpace(request.DireccionTexto) || request.Latitud.HasValue || request.Longitud.HasValue)
        {
            var direccion = new Direccion
            {
                DireccionTexto = !string.IsNullOrWhiteSpace(request.DireccionTexto) 
                    ? request.DireccionTexto.Trim() 
                    : $"Lat: {request.Latitud}, Lng: {request.Longitud}",
                Latitud = request.Latitud,
                Longitud = request.Longitud
            };
            _context.Direcciones.Add(direccion);
            await _context.SaveChangesAsync();
            idDireccion = direccion.Id;
        }

        // Crear registro en tabla 'fechas' si se enviaron fechas
        int? idFecha = null;
        if (request.FechaInicio.HasValue || request.FechaFin.HasValue)
        {
            var fecha = new Fecha
            {
                FechaInicio = request.FechaInicio,
                FechaFin = request.FechaFin
            };
            _context.Fechas.Add(fecha);
            await _context.SaveChangesAsync();
            idFecha = fecha.Id;
        }

        var nuevoReporte = new Reporte
        {
            IdUser = request.IdUser,
            IdEstado = estadoInicial.Id,
            IdIncidente = request.IdIncidente,
            IdDireccion = idDireccion,
            IdFecha = idFecha,
            Titulo = request.Titulo.Trim(),
            Descripcion = request.Descripcion?.Trim(),
            Prioridad = string.IsNullOrWhiteSpace(request.Prioridad) ? "Media" : request.Prioridad.Trim(),
            Hora = !string.IsNullOrWhiteSpace(request.Hora) ? request.Hora.Trim() : DateTime.Now.ToString("HH:mm"),
            FechaCreacion = DateTime.UtcNow
        };

        _context.Reportes.Add(nuevoReporte);
        await _context.SaveChangesAsync();

        // Registrar en historial_estados la creación
        var primerHistorial = new HistorialEstado
        {
            IdReporte = nuevoReporte.Id,
            IdUser = request.IdUser,
            EstadoAnterior = null,
            EstadoNuevo = estadoInicial.Nombre,
            Fecha = DateTime.UtcNow
        };
        _context.HistorialesEstados.Add(primerHistorial);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReporte), new { id = nuevoReporte.Id }, new
        {
            mensaje = "Reporte creado exitosamente",
            id = nuevoReporte.Id,
            estado = estadoInicial.Nombre
        });
    }

    /// <summary>
    /// Agregar una respuesta o comentario a un reporte.
    /// </summary>
    [HttpPost("{id}/respuestas")]
    public async Task<IActionResult> AgregarRespuesta(int id, [FromBody] CrearRespuestaDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Comentario))
        {
            return BadRequest("El comentario no puede estar vacío.");
        }

        var reporteExiste = await _context.Reportes.AnyAsync(r => r.Id == id);
        if (!reporteExiste)
        {
            return NotFound("Reporte no encontrado.");
        }

        var usuario = await _context.Usuarios.FindAsync(request.IdUser);
        if (usuario == null)
        {
            return BadRequest("Usuario no encontrado.");
        }

        var respuesta = new Respuesta
        {
            IdReporte = id,
            IdUser = request.IdUser,
            Comentario = request.Comentario.Trim(),
            Fecha = DateTime.UtcNow
        };

        _context.Respuestas.Add(respuesta);
        await _context.SaveChangesAsync();

        return Ok(new RespuestaItemDto
        {
            Id = respuesta.Id,
            IdUser = respuesta.IdUser,
            UsuarioNombre = $"{usuario.Nombre} {usuario.Apellido}".Trim(),
            Comentario = respuesta.Comentario,
            Fecha = respuesta.Fecha
        });
    }

    /// <summary>
    /// Cambiar el estado de un reporte y registrar el evento en historial_estados.
    /// </summary>
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto request)
    {
        var reporte = await _context.Reportes
            .Include(r => r.Estado)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
        {
            return NotFound("Reporte no encontrado.");
        }

        var nuevoEstado = await _context.Estados.FindAsync(request.NuevoIdEstado);
        if (nuevoEstado == null)
        {
            return BadRequest("El nuevo estado especificado no existe.");
        }

        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == request.IdUser);
        if (!usuarioExiste)
        {
            return BadRequest("Usuario no encontrado.");
        }

        var estadoAnterior = reporte.Estado?.Nombre ?? "Desconocido";
        reporte.IdEstado = request.NuevoIdEstado;

        var historial = new HistorialEstado
        {
            IdReporte = id,
            IdUser = request.IdUser,
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = nuevoEstado.Nombre,
            Fecha = DateTime.UtcNow
        };

        _context.HistorialesEstados.Add(historial);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Estado actualizado con éxito.",
            estadoAnterior,
            estadoNuevo = nuevoEstado.Nombre
        });
    }

    /// <summary>
    /// Catálogo de estados disponibles.
    /// </summary>
    [HttpGet("estados")]
    public async Task<IActionResult> GetEstados()
    {
        var estados = await _context.Estados
            .Select(e => new CatalogoDto
            {
                Id = e.Id,
                Nombre = e.Nombre
            })
            .ToListAsync();

        return Ok(estados);
    }

    /// <summary>
    /// Catálogo de tipos de incidentes disponibles.
    /// </summary>
    [HttpGet("incidentes")]
    public async Task<IActionResult> GetIncidentes()
    {
        var incidentes = await _context.Incidentes
            .Select(i => new CatalogoDto
            {
                Id = i.Id,
                Nombre = i.Nombre,
                Descripcion = i.Descripcion
            })
            .ToListAsync();

        return Ok(incidentes);
    }
}
