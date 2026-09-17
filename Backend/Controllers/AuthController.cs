using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Models;
using Backend.Services;
using BCrypt.Net;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Iniciar sesión con email y contraseña.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("El correo y la contraseña son requeridos.");
        }

        var cleanEmail = request.Email.Trim().ToLower();

        var usuario = await _context.Usuarios
            .Include(u => u.Municipio)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);

        if (usuario == null)
        {
            return Unauthorized("Usuario o contraseña incorrectos");
        }

        if (!usuario.Activo)
        {
            return Unauthorized("La cuenta del usuario se encuentra inactiva.");
        }

        // Verificar contraseña (soporta BCrypt o texto plano para contraseñas de desarrollo)
        bool isValidPassword = false;
        if (usuario.Contrasena.StartsWith("$2a$") || usuario.Contrasena.StartsWith("$2b$") || usuario.Contrasena.StartsWith("$2y$"))
        {
            isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, usuario.Contrasena);
        }
        else
        {
            isValidPassword = usuario.Contrasena == request.Password;
        }

        if (!isValidPassword)
        {
            return Unauthorized("Usuario o contraseña incorrectos");
        }

        var token = _jwtService.GenerateToken(usuario);

        var response = new LoginResponseDto
        {
            Token = token,
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellido = usuario.Apellido,
            Email = usuario.Email,
            Rol = usuario.Rol,
            IdMun = usuario.IdMun,
            Activo = usuario.Activo
        };

        return Ok(response);
    }

    /// <summary>
    /// Comprobar si un email ya está registrado antes de enviar código de registro.
    /// </summary>
    [HttpPost("comprobar-email")]
    public async Task<IActionResult> ComprobarEmail([FromBody] ComprobarEmailDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("El email es requerido.");
        }

        var cleanEmail = request.Email.Trim().ToLower();
        var existe = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == cleanEmail);

        if (existe)
        {
            return BadRequest("Ya existe una cuenta con ese correo electrónico");
        }

        return Ok(new { disponible = true, mensaje = "El correo está disponible." });
    }

    /// <summary>
    /// Registrar un nuevo usuario en la base de datos tras verificar el código.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Todos los campos obligatorios deben completarse.");
        }

        var cleanEmail = request.Email.Trim().ToLower();
        var existe = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == cleanEmail);
        if (existe)
        {
            return BadRequest("El correo electrónico ya está registrado.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var nuevoUsuario = new Usuario
        {
            Nombre = request.Nombre.Trim(),
            Apellido = request.Apellido.Trim(),
            Email = cleanEmail,
            Contrasena = passwordHash,
            Rol = string.IsNullOrWhiteSpace(request.Rol) ? "Alumno" : request.Rol.Trim(),
            IdMun = request.IdMun,
            Activo = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Usuarios.Add(nuevoUsuario);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Cuenta creada con éxito", id = nuevoUsuario.Id });
    }

    /// <summary>
    /// Verificar si el email existe para iniciar recuperación de contraseña.
    /// </summary>
    [HttpPost("verificar-email")]
    public async Task<IActionResult> VerificarEmail([FromBody] ComprobarEmailDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("El email es requerido.");
        }

        var cleanEmail = request.Email.Trim().ToLower();
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);

        if (usuario == null)
        {
            return NotFound("No encontramos ninguna cuenta activa asociada a este correo");
        }

        return Ok(new { existe = true, email = usuario.Email });
    }

    /// <summary>
    /// Resetear la contraseña tras confirmación de código de recuperación.
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email y nueva contraseña son requeridos.");
        }

        var cleanEmail = request.Email.Trim().ToLower();
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);

        if (usuario == null)
        {
            return NotFound("Usuario no encontrado.");
        }

        usuario.Contrasena = BCrypt.Net.BCrypt.HashPassword(request.Password);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Contraseña actualizada exitosamente." });
    }
}
