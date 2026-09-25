using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Data;

public class DataSeeder
{
    private readonly AppDbContext _context;

    public DataSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Ensure Municipio exists
        if (!await _context.Municipios.AnyAsync())
        {
            _context.Municipios.Add(new Municipio { Nombre = "Morón", DireccionOficina = "Calle 1" });
        }

        // Seed Estados
        var estadosNecesarios = new[] { "Pendiente", "En Proceso", "Resuelto", "Cancelado" };
        var estadosExistentes = await _context.Estados.Select(e => e.Nombre).ToListAsync();
        foreach (var nombre in estadosNecesarios)
        {
            if (!estadosExistentes.Any(e => e.Equals(nombre, StringComparison.OrdinalIgnoreCase)))
            {
                _context.Estados.Add(new Estado { Nombre = nombre });
            }
        }

        // Seed Incidentes (categories)
        var incidentesNecesarios = new List<Incidente>
        {
            new Incidente { Nombre = "Vía Pública", Descripcion = "Incidentes de vía pública" },
            new Incidente { Nombre = "Luminarias", Descripcion = "Problemas con luminarias" },
            new Incidente { Nombre = "Basura", Descripcion = "Acumulación de basura" },
            new Incidente { Nombre = "Pavimento", Descripcion = "Daños en pavimento" },
            new Incidente { Nombre = "Señalización", Descripcion = "Fallas en señalización" },
            new Incidente { Nombre = "Otros", Descripcion = "Otros incidentes" }
        };
        var incidentesExistentes = await _context.Incidentes.Select(i => i.Nombre).ToListAsync();
        foreach (var inc in incidentesNecesarios)
        {
            if (!incidentesExistentes.Any(i => i.Equals(inc.Nombre, StringComparison.OrdinalIgnoreCase)))
            {
                _context.Incidentes.Add(inc);
            }
        }

        // Ensure admin user exists
        var adminEmail = "lucianocao335@gmail.com";
        var admin = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (admin == null)
        {
            _context.Usuarios.Add(new Usuario
            {
                IdMun = 1,
                Nombre = "Admin",
                Apellido = "User",
                Email = adminEmail,
                Contrasena = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Rol = "Admin",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            });
        }
        else if (!admin.Rol.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            admin.Rol = "Admin";
        }

        await _context.SaveChangesAsync();
    }
}
