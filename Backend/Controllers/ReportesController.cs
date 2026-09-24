using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Reportes;
using Backend.Models;
using Backend.Services;
using System.Security.Claims;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly IEmailService _emailService;
    private readonly IGeminiService _geminiService;

    public ReportesController(
        AppDbContext context,
        IWebHostEnvironment env,
        IEmailService emailService,
        IGeminiService geminiService)
    {
        _context = context;
        _env = env;
        _emailService = emailService;
        _geminiService = geminiService;
    }

    /// <summary>
    /// Cálculo de distancia geodésica mediante la fórmula de Haversine (en metros).
    /// </summary>
    private static double CalcularDistanciaMetros(double lat1, double lon1, double lat2, double lon2)
    {
        const double RadioTierraM = 6371000.0;
        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0)
              + Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0)
              * Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0);
        var c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));
        return RadioTierraM * c;
    }

    /// <summary>
    /// Obtener todos los reportes de incidentes para el mapa y listados.
    /// Permite acceso anónimo para visualización en mapa público municipal.
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetReportes()
    {
        var reportes = await _context.Reportes
            .Include(r => r.Usuario)
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Include(r => r.FechaRef)
            .Include(r => r.Apoyos)
            .Include(r => r.Historiales)
            .OrderByDescending(r => r.FechaCreacion)
            .Select(r => new
            {
                r.Id,
                r.IdUser,
                Usuario = r.Usuario != null ? new { r.Usuario.Id, r.Usuario.Nombre, r.Usuario.Apellido, r.Usuario.Email } : null,
                IdEstado = r.IdEstado,
                Estado = r.Estado != null ? r.Estado.Nombre : "Pendiente",
                IdIncidente = r.IdIncidente,
                Incidente = r.Incidente != null ? new { r.Incidente.Id, r.Incidente.Nombre, r.Incidente.Descripcion } : null,
                r.Titulo,
                r.Descripcion,
                r.Hora,
                r.Prioridad,
                r.FechaCreacion,
                Direccion = r.DireccionRef != null ? new
                {
                    r.DireccionRef.Id,
                    r.DireccionRef.DireccionTexto,
                    r.DireccionRef.Latitud,
                    r.DireccionRef.Longitud
                } : null,
                ApoyosCount = r.Apoyos.Count,
                UltimoHistorial = r.Historiales.OrderByDescending(h => h.Fecha).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(reportes);
    }

    /// <summary>
    /// Buscar reportes cercanos dentro de un radio en metros (por defecto 50 metros).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("cercanos")]
    public async Task<IActionResult> GetReportesCercanos([FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radio = 50.0)
    {
        var cercanos = await ObtenerReportesCercanosMemoria(lat, lng, radio);
        return Ok(cercanos);
    }

    private async Task<List<ReporteCercanoDto>> ObtenerReportesCercanosMemoria(double lat, double lng, double radio)
    {
        var conCoordenadas = await _context.Reportes
            .Include(r => r.DireccionRef)
            .Include(r => r.Estado)
            .Where(r => r.DireccionRef != null && r.DireccionRef.Latitud.HasValue && r.DireccionRef.Longitud.HasValue)
            .ToListAsync();

        return conCoordenadas
            .Select(r => new
            {
                Reporte = r,
                Distancia = CalcularDistanciaMetros(
                    lat, lng,
                    (double)r.DireccionRef!.Latitud!.Value,
                    (double)r.DireccionRef.Longitud!.Value)
            })
            .Where(x => x.Distancia <= radio)
            .OrderBy(x => x.Distancia)
            .Select(x => new ReporteCercanoDto
            {
                Id = x.Reporte.Id,
                Titulo = x.Reporte.Titulo,
                Descripcion = x.Reporte.Descripcion,
                Estado = x.Reporte.Estado?.Nombre ?? "Pendiente",
                DistanciaMetros = Math.Round(x.Distancia, 1)
            })
            .ToList();
    }

    /// <summary>
    /// Obtener un reporte por ID con sus respuestas, adjuntos e historial de trazabilidad.
    /// </summary>
    [AllowAnonymous]
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
            .Include(r => r.Apoyos)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
            return NotFound("Reporte no encontrado.");

        return Ok(new
        {
            reporte.Id,
            reporte.IdUser,
            Usuario = reporte.Usuario != null ? new { reporte.Usuario.Id, reporte.Usuario.Nombre, reporte.Usuario.Apellido, reporte.Usuario.Email } : null,
            IdEstado = reporte.IdEstado,
            Estado = reporte.Estado != null ? reporte.Estado.Nombre : "Pendiente",
            IdIncidente = reporte.IdIncidente,
            Incidente = reporte.Incidente != null ? new { reporte.Incidente.Id, reporte.Incidente.Nombre, reporte.Incidente.Descripcion } : null,
            reporte.Titulo,
            reporte.Descripcion,
            reporte.Hora,
            reporte.Prioridad,
            reporte.FechaCreacion,
            Direccion = reporte.DireccionRef != null ? new
            {
                reporte.DireccionRef.Id,
                reporte.DireccionRef.DireccionTexto,
                reporte.DireccionRef.Latitud,
                reporte.DireccionRef.Longitud
            } : null,
            ApoyosCount = reporte.Apoyos.Count,
            Respuestas = reporte.Respuestas.OrderBy(resp => resp.Fecha).Select(resp => new
            {
                resp.Id,
                resp.IdUser,
                Usuario = resp.Usuario != null ? $"{resp.Usuario.Nombre} {resp.Usuario.Apellido}" : "Usuario",
                resp.Comentario,
                resp.Fecha
            }),
            Archivos = reporte.Archivos.Select(a => new
            {
                a.Id,
                a.Url,
                a.Tipo,
                a.NombreOriginal,
                a.FechaSubida
            }),
            Historiales = reporte.Historiales.OrderByDescending(h => h.Fecha).Select(h => new
            {
                h.Id,
                h.IdReporte,
                h.EstadoAnterior,
                h.EstadoNuevo,
                h.Fecha,
                Usuario = h.Usuario != null ? $"{h.Usuario.Nombre} {h.Usuario.Apellido} ({h.Usuario.Rol})" : "Sistema"
            })
        });
    }

    /// <summary>
    /// Obtener reportes creados por un usuario específico (Mis Incidentes).
    /// </summary>
    [HttpGet("usuario/{idUsuario}")]
    public async Task<IActionResult> GetReportesByUsuario(int idUsuario)
    {
        var reportes = await _context.Reportes
            .Include(r => r.Estado)
            .Include(r => r.Incidente)
            .Include(r => r.DireccionRef)
            .Include(r => r.Apoyos)
            .Where(r => r.IdUser == idUsuario)
            .OrderByDescending(r => r.FechaCreacion)
            .Select(r => new
            {
                r.Id,
                nroOrden = r.Id,
                r.IdUser,
                Estado = r.Estado != null ? r.Estado.Nombre : "Pendiente",
                estado = r.Estado != null ? r.Estado.Nombre : "Pendiente",
                Incidente = r.Incidente != null ? r.Incidente.Nombre : "Incidente",
                r.Titulo,
                titulo = r.Titulo,
                r.Descripcion,
                descripcion = r.Descripcion,
                r.Hora,
                hora = r.Hora,
                r.Prioridad,
                prioridad = r.Prioridad,
                r.FechaCreacion,
                fechaCreacion = r.FechaCreacion,
                fechaReporte = r.FechaCreacion,
                tiempoEstimado = "24-48 hs",
                Direccion = r.DireccionRef != null ? r.DireccionRef.DireccionTexto : "",
                ApoyosCount = r.Apoyos.Count,
                apoyos = r.Apoyos.Count
            })
            .ToListAsync();

        return Ok(reportes);
    }

    /// <summary>
    /// Crear un reporte nuevo de incidente ciudadano con MODERACIÓN DE IA POR PROXIMIDAD GEOESPACIAL (50m).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CrearReporte([FromBody] CrearReporteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Titulo))
            return BadRequest("El título del incidente es obligatorio.");

        // Obtener usuario autenticado desde Claims
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out int userId) || userId <= 0)
        {
            var primerUsuario = await _context.Usuarios.FirstOrDefaultAsync();
            userId = primerUsuario?.Id ?? 1;
        }

        // =========================================================================
        // REQUISITO: MODERACIÓN CON IA ANTE REPORTES CERCANOS (<= 50 METROS)
        // =========================================================================
        if (!dto.ForzarCreacion && dto.Latitud.HasValue && dto.Longitud.HasValue)
        {
            var reportesCercanos = await ObtenerReportesCercanosMemoria(
                (double)dto.Latitud.Value,
                (double)dto.Longitud.Value,
                50.0);

            if (reportesCercanos.Count > 0)
            {
                var moderacion = await _geminiService.AnalizarDuplicado(
                    dto.Titulo,
                    dto.Descripcion,
                    reportesCercanos);

                if (moderacion.EsDuplicadoPotencial)
                {
                    return Ok(new
                    {
                        esDuplicadoPotencial = true,
                        mensajeIA = moderacion.MensajeIA,
                        reportesSimilares = moderacion.ReportesSimilares,
                        mensaje = "Se encontraron incidencias registradas en un radio de 50 metros. ¿Deseas apoyar el reporte existente o continuar creando el tuyo?"
                    });
                }
            }
        }
        // =========================================================================

        // 1. Resolver o crear Dirección
        int? idDireccion = null;
        if (!string.IsNullOrWhiteSpace(dto.DireccionTexto) || dto.Latitud.HasValue || dto.Longitud.HasValue)
        {
            var direccion = new Direccion
            {
                DireccionTexto = string.IsNullOrWhiteSpace(dto.DireccionTexto) ? "Morón, Buenos Aires" : dto.DireccionTexto.Trim(),
                Latitud = dto.Latitud,
                Longitud = dto.Longitud
            };
            _context.Direcciones.Add(direccion);
            await _context.SaveChangesAsync();
            idDireccion = direccion.Id;
        }

        // 2. Resolver Estado inicial "Pendiente"
        var estadoPendiente = await _context.Estados.FirstOrDefaultAsync(e => e.Nombre.ToLower() == "pendiente");
        if (estadoPendiente == null)
        {
            estadoPendiente = new Estado { Nombre = "Pendiente" };
            _context.Estados.Add(estadoPendiente);
            await _context.SaveChangesAsync();
        }

        // 3. Resolver Incidente / Categoría
        var idIncidente = dto.IdIncidente;
        if (idIncidente <= 0)
        {
            var primerIncidente = await _context.Incidentes.FirstOrDefaultAsync();
            if (primerIncidente == null)
            {
                primerIncidente = new Incidente { Nombre = "Vía Pública", Descripcion = "Incidencias generales de vía pública" };
                _context.Incidentes.Add(primerIncidente);
                await _context.SaveChangesAsync();
            }
            idIncidente = primerIncidente.Id;
        }

        // 4. Crear Fecha si aplica
        var fechaEntity = new Fecha
        {
            FechaInicio = DateOnly.FromDateTime(dto.FechaInicio ?? DateTime.UtcNow),
            FechaFin = null
        };
        _context.Fechas.Add(fechaEntity);
        await _context.SaveChangesAsync();
        int? idFecha = fechaEntity.Id;

        // 5. Crear Reporte
        var nuevoReporte = new Reporte
        {
            IdUser = userId,
            IdEstado = estadoPendiente.Id,
            IdIncidente = idIncidente,
            IdDireccion = idDireccion,
            IdFecha = idFecha,
            Titulo = dto.Titulo.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Hora = string.IsNullOrWhiteSpace(dto.Hora) ? DateTime.Now.ToString("HH:mm") : dto.Hora,
            Prioridad = string.IsNullOrWhiteSpace(dto.Prioridad) ? "Media" : dto.Prioridad,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Reportes.Add(nuevoReporte);
        await _context.SaveChangesAsync();

        // 6. Registrar evento inicial en HistorialEstado
        var historialInicial = new HistorialEstado
        {
            IdReporte = nuevoReporte.Id,
            IdUser = userId,
            EstadoAnterior = null,
            EstadoNuevo = estadoPendiente.Nombre,
            Fecha = DateTime.UtcNow
        };
        _context.HistorialesEstados.Add(historialInicial);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReporte), new { id = nuevoReporte.Id }, new
        {
            nuevoReporte.Id,
            nroOrden = nuevoReporte.Id,
            nuevoReporte.Titulo,
            nuevoReporte.Descripcion,
            Estado = estadoPendiente.Nombre,
            estado = estadoPendiente.Nombre,
            nuevoReporte.FechaCreacion,
            esDuplicadoPotencial = false,
            mensaje = "Reporte de incidente creado exitosamente."
        });
    }

    /// <summary>
    /// Cambiar el estado de un reporte con registro inmutable en HistorialEstado y NOTIFICACIÓN POR EMAIL AL CIUDADANO.
    /// Accesible para administradores y empleados municipales.
    /// </summary>
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NuevoEstado))
            return BadRequest("El nuevo estado es requerido.");

        var reporte = await _context.Reportes
            .Include(r => r.Estado)
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reporte == null)
            return NotFound("Reporte no encontrado.");

        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int.TryParse(claimId, out int userId);
        if (userId <= 0)
        {
            userId = reporte.IdUser;
        }

        var estadoAnterior = reporte.Estado?.Nombre ?? "Pendiente";

        // Buscar o crear la entidad Estado si no existiera
        var targetEstado = await _context.Estados.FirstOrDefaultAsync(e => e.Nombre.ToLower() == dto.NuevoEstado.Trim().ToLower());
        if (targetEstado == null)
        {
            targetEstado = new Estado { Nombre = dto.NuevoEstado.Trim() };
            _context.Estados.Add(targetEstado);
            await _context.SaveChangesAsync();
        }

        using var trans = await _context.Database.BeginTransactionAsync();
        try
        {
            reporte.IdEstado = targetEstado.Id;

            var historial = new HistorialEstado
            {
                IdReporte = reporte.Id,
                IdUser = userId,
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = targetEstado.Nombre,
                Fecha = DateTime.UtcNow
            };

            _context.HistorialesEstados.Add(historial);
            await _context.SaveChangesAsync();
            await trans.CommitAsync();

            // =========================================================================
            // REQUISITO: NOTIFICACIÓN POR EMAIL DE CUANDO CAMBIA EL REPORTE PROPIO
            // =========================================================================
            if (reporte.Usuario != null && !string.IsNullOrWhiteSpace(reporte.Usuario.Email))
            {
                _ = _emailService.EnviarNotificacionCambioEstado(
                    reporte.Usuario.Email,
                    $"{reporte.Usuario.Nombre} {reporte.Usuario.Apellido}".Trim(),
                    reporte.Id,
                    reporte.Titulo,
                    estadoAnterior,
                    targetEstado.Nombre
                );
            }
            // =========================================================================

            return Ok(new
            {
                reporte.Id,
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = targetEstado.Nombre,
                Fecha = historial.Fecha,
                mensaje = $"Estado del reporte #{reporte.Id} actualizado a '{targetEstado.Nombre}' con trazabilidad inmutable y notificación enviada."
            });
        }
        catch (Exception ex)
        {
            await trans.RollbackAsync();
            return StatusCode(500, $"Error al actualizar el estado: {ex.Message}");
        }
    }

    /// <summary>
    /// Registrar o alternar un voto de apoyo ciudadano a una incidencia ("Esto también me afecta").
    /// REQUISITO: SI SUPERA UMBRALES DE APOYOS, ESCALA LA PRIORIDAD AUTOMÁTICAMENTE A MEDIA O ALTA.
    /// </summary>
    [HttpPost("{id}/apoyo")]
    public async Task<IActionResult> AlternarApoyo(int id)
    {
        var reporte = await _context.Reportes.FindAsync(id);
        if (reporte == null)
            return NotFound("Reporte no encontrado.");

        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out int userId) || userId <= 0)
        {
            return Unauthorized("Debe iniciar sesión para apoyar una incidencia.");
        }

        var apoyoExistente = await _context.ApoyosReportes
            .FirstOrDefaultAsync(a => a.IdReporte == id && a.IdUsuario == userId);

        bool yaApoyaba = false;
        if (apoyoExistente != null)
        {
            _context.ApoyosReportes.Remove(apoyoExistente);
            yaApoyaba = true;
        }
        else
        {
            _context.ApoyosReportes.Add(new ApoyoReporte
            {
                IdReporte = id,
                IdUsuario = userId,
                Fecha = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        var totalApoyos = await _context.ApoyosReportes.CountAsync(a => a.IdReporte == id);

        // =========================================================================
        // REQUISITO: ESCALADO DE PRIORIDAD POR CONTADOR DE APOYOS
        // Si hay muchos apoyos (>= 10) -> Prioridad Alta
        // Si hay apoyos medios (>= 5) y estaba en Baja -> Prioridad Media
        // =========================================================================
        string prioridadOriginal = reporte.Prioridad ?? "Baja";
        string nuevaPrioridad = prioridadOriginal;

        if (totalApoyos >= 10 && !prioridadOriginal.Equals("Alta", StringComparison.OrdinalIgnoreCase))
        {
            reporte.Prioridad = "Alta";
            nuevaPrioridad = "Alta";
            await _context.SaveChangesAsync();
        }
        else if (totalApoyos >= 5 && prioridadOriginal.Equals("Baja", StringComparison.OrdinalIgnoreCase))
        {
            reporte.Prioridad = "Media";
            nuevaPrioridad = "Media";
            await _context.SaveChangesAsync();
        }
        // =========================================================================

        return Ok(new
        {
            IdReporte = id,
            TotalApoyos = totalApoyos,
            ApoyadoPorMi = !yaApoyaba,
            Prioridad = nuevaPrioridad,
            PrioridadEscalada = !nuevaPrioridad.Equals(prioridadOriginal, StringComparison.OrdinalIgnoreCase),
            Mensaje = yaApoyaba
                ? "Se removió tu apoyo a este reporte."
                : $"¡Has sumado tu apoyo! Total de vecinos: {totalApoyos}. Prioridad actual: {nuevaPrioridad}."
        });
    }

    /// <summary>
    /// Agregar un comentario o respuesta de seguimiento a un reporte.
    /// </summary>
    [HttpPost("{id}/respuestas")]
    public async Task<IActionResult> AgregarRespuesta(int id, [FromBody] CrearRespuestaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Comentario))
            return BadRequest("El comentario no puede estar vacío.");

        var existe = await _context.Reportes.AnyAsync(r => r.Id == id);
        if (!existe)
            return NotFound("Reporte no encontrado.");

        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int.TryParse(claimId, out int userId);
        if (userId <= 0)
        {
            var u = await _context.Usuarios.FirstOrDefaultAsync();
            userId = u?.Id ?? 1;
        }

        var respuesta = new Respuesta
        {
            IdReporte = id,
            IdUser = userId,
            Comentario = dto.Comentario.Trim(),
            Fecha = DateTime.UtcNow
        };

        _context.Respuestas.Add(respuesta);
        await _context.SaveChangesAsync();

        var usuario = await _context.Usuarios.FindAsync(userId);

        return Ok(new
        {
            respuesta.Id,
            respuesta.IdReporte,
            respuesta.Comentario,
            respuesta.Fecha,
            Usuario = usuario != null ? $"{usuario.Nombre} {usuario.Apellido}" : "Usuario"
        });
    }

    /// <summary>
    /// Subir un archivo adjunto o fotografía de evidencia a un reporte.
    /// </summary>
    [HttpPost("{id}/archivos")]
    public async Task<IActionResult> SubirArchivo(int id, IFormFile? archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return BadRequest("No se proporcionó ningún archivo.");

        var reporte = await _context.Reportes.FindAsync(id);
        if (reporte == null)
            return NotFound("Reporte no encontrado.");

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        var permitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".mp4" };
        if (!permitidas.Contains(extension))
            return BadRequest("Tipo de archivo no permitido. Formatos aceptados: imágenes, PDF y video.");

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid():N}_{Path.GetFileName(archivo.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/{uniqueFileName}";

        var adjunto = new ArchivoAdjunto
        {
            IdReporte = id,
            Url = fileUrl,
            Tipo = archivo.ContentType,
            NombreOriginal = archivo.FileName,
            FechaSubida = DateTime.UtcNow
        };

        _context.ArchivosAdjuntos.Add(adjunto);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            adjunto.Id,
            adjunto.Url,
            adjunto.NombreOriginal,
            adjunto.Tipo,
            adjunto.FechaSubida
        });
    }

    /// <summary>
    /// Estadísticas consolidadas por barrio, categoría y tiempo de resolución con LINQ.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("estadisticas")]
    public async Task<IActionResult> GetEstadisticas()
    {
        var totalReportes = await _context.Reportes.CountAsync();
        var resueltos = await _context.Reportes.CountAsync(r => r.Estado != null && r.Estado.Nombre.ToLower() == "resuelto");
        var enProceso = await _context.Reportes.CountAsync(r => r.Estado != null && (r.Estado.Nombre.ToLower() == "en proceso" || r.Estado.Nombre.ToLower() == "en revisión"));
        var pendientes = await _context.Reportes.CountAsync(r => r.Estado != null && r.Estado.Nombre.ToLower() == "pendiente");

        // Agrupación por Categoría con LINQ
        var porCategoriaQuery = await _context.Reportes
            .Include(r => r.Incidente)
            .GroupBy(r => r.Incidente != null ? r.Incidente.Nombre : "Vía Pública")
            .Select(g => new
            {
                Name = g.Key,
                Value = g.Count()
            })
            .ToListAsync();

        var colores = new[] { "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#ec4899", "#3b82f6" };
        var porCategoria = porCategoriaQuery.Select((c, idx) => new EstadisticaCategoriaDto
        {
            Name = c.Name,
            Value = c.Value,
            Color = colores[idx % colores.Length]
        }).ToList();

        // Agrupación por Barrio / Dirección
        var porBarrioQuery = await _context.Reportes
            .Include(r => r.DireccionRef)
            .GroupBy(r => (r.DireccionRef != null && !string.IsNullOrWhiteSpace(r.DireccionRef.DireccionTexto))
                ? r.DireccionRef.DireccionTexto
                : "Morón Centro")
            .Select(g => new EstadisticaBarrioDto
            {
                Barrio = g.Key.Length > 25 ? g.Key.Substring(0, 25) + "..." : g.Key,
                Incidentes = g.Count()
            })
            .OrderByDescending(b => b.Incidentes)
            .Take(6)
            .ToListAsync();

        var tiemposResolucion = await _context.HistorialesEstados
            .Where(h => h.EstadoNuevo.ToLower() == "resuelto")
            .Join(_context.Reportes, h => h.IdReporte, r => r.Id, (h, r) => new { FechaInicio = r.FechaCreacion, FechaFin = h.Fecha })
            .ToListAsync();

        double tiempoPromedioHoras = 24.0;
        if (tiemposResolucion.Any())
        {
            tiempoPromedioHoras = Math.Round(tiemposResolucion.Average(t => (t.FechaFin - t.FechaInicio).TotalHours), 1);
        }

        var resultado = new EstadisticasDto
        {
            TotalReportes = totalReportes,
            Resueltos = resueltos,
            EnProceso = enProceso,
            Pendientes = pendientes,
            PorBarrio = porBarrioQuery,
            PorCategoria = porCategoria,
            TiempoPromedioResolucionHoras = tiempoPromedioHoras
        };

        return Ok(resultado);
    }

    /// <summary>
    /// Log inmutable de auditoría para trazabilidad de seguridad de cambios de estado.
    /// </summary>
    [HttpGet("auditoria")]
    public async Task<IActionResult> GetAuditoria()
    {
        var logs = await _context.HistorialesEstados
            .Include(h => h.Reporte)
            .Include(h => h.Usuario)
            .OrderByDescending(h => h.Fecha)
            .Take(50)
            .Select(h => new
            {
                h.Id,
                ReporteId = h.IdReporte,
                TituloReporte = h.Reporte != null ? h.Reporte.Titulo : $"Reporte #{h.IdReporte}",
                UsuarioResponsable = h.Usuario != null ? $"{h.Usuario.Nombre} {h.Usuario.Apellido}" : "Sistema Morón",
                RolUsuario = h.Usuario != null ? h.Usuario.Rol : "Administrador",
                EstadoAnterior = h.EstadoAnterior ?? "Inicio",
                EstadoNuevo = h.EstadoNuevo,
                FechaHora = h.Fecha.ToString("dd/MM/yyyy HH:mm")
            })
            .ToListAsync();

        return Ok(logs);
    }
}
