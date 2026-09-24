using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Usuario;
using BCrypt.Net;
using System.Security.Claims;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuarioController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Cambiar la contraseña del usuario. Soporta autenticación por token o validación con password actual.
    /// </summary>
    [AllowAnonymous]
    [HttpPut("cambiar-password")]
    public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordDto request)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int targetUserId = request.IdUsuario;
        if (int.TryParse(claimId, out int authUserId) && authUserId > 0)
        {
            var esAdmin = User.IsInRole("Admin");
            if (!esAdmin && authUserId != targetUserId)
            {
                targetUserId = authUserId;
            }
        }

        if (targetUserId <= 0)
        {
            return BadRequest("Id de usuario inválido.");
        }

        var usuario = await _context.Usuarios.FindAsync(targetUserId);
        if (usuario == null)
        {
            return NotFound("Usuario no encontrado.");
        }

        // Verificar contraseña actual
        bool isValid = false;
        if (usuario.Contrasena.StartsWith("$2a$") || usuario.Contrasena.StartsWith("$2b$") || usuario.Contrasena.StartsWith("$2y$"))
        {
            isValid = BCrypt.Net.BCrypt.Verify(request.PasswordActual, usuario.Contrasena);
        }
        else
        {
            isValid = usuario.Contrasena == request.PasswordActual;
        }

        if (!isValid)
        {
            return BadRequest("La contraseña actual es incorrecta.");
        }

        usuario.Contrasena = BCrypt.Net.BCrypt.HashPassword(request.PasswordNueva);
        await _context.SaveChangesAsync();

        return Ok("Contraseña actualizada con éxito.");
    }

    /// <summary>
    /// Eliminar cuenta de usuario tras confirmar la contraseña.
    /// </summary>
    [HttpDelete("eliminar/{id}")]
    public async Task<IActionResult> EliminarCuenta(int id, [FromBody] EliminarCuentaDto request)
    {
        if (id <= 0)
        {
            return BadRequest("Id de usuario inválido.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Debe ingresar su contraseña para confirmar la eliminación de la cuenta.");
        }

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound("Usuario no encontrado.");
        }

        // Verificar contraseña
        bool isValid = false;
        if (usuario.Contrasena.StartsWith("$2a$") || usuario.Contrasena.StartsWith("$2b$") || usuario.Contrasena.StartsWith("$2y$"))
        {
            isValid = BCrypt.Net.BCrypt.Verify(request.Password, usuario.Contrasena);
        }
        else
        {
            isValid = usuario.Contrasena == request.Password;
        }

        if (!isValid)
        {
            return BadRequest("Contraseña incorrecta.");
        }

        // Eliminar usuario en cascada según configuración de base de datos
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Cuenta eliminada exitosamente." });
    }

    /// <summary>
    /// Cerrar sesión (accesible anónimamente).
    /// </summary>
    [AllowAnonymous]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { mensaje = "Sesión cerrada correctamente." });
    }

    /// <summary>
    /// Obtener información del usuario por ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Municipio)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return NotFound("Usuario no encontrado.");
        }

        var dto = new UsuarioDto
        {
            Id = usuario.Id,
            IdMun = usuario.IdMun,
            Nombre = usuario.Nombre,
            Apellido = usuario.Apellido,
            Email = usuario.Email,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            CreatedAt = usuario.CreatedAt
        };

        return Ok(dto);
    }
}
