using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Municipio> Municipios { get; set; } = null!;
    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Estado> Estados { get; set; } = null!;
    public DbSet<Incidente> Incidentes { get; set; } = null!;
    public DbSet<Fecha> Fechas { get; set; } = null!;
    public DbSet<Direccion> Direcciones { get; set; } = null!;
    public DbSet<Reporte> Reportes { get; set; } = null!;
    public DbSet<Respuesta> Respuestas { get; set; } = null!;
    public DbSet<ArchivoAdjunto> ArchivosAdjuntos { get; set; } = null!;
    public DbSet<HistorialEstado> HistorialesEstados { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Mapeo de tablas y columnas (PostgreSQL snake_case)
        modelBuilder.Entity<Municipio>(entity =>
        {
            entity.ToTable("municipio");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
            entity.Property(e => e.DireccionOficina).HasColumnName("direccion_oficina").HasMaxLength(255);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdMun).HasColumnName("id_mun");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Apellido).HasColumnName("apellido").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Contrasena).HasColumnName("contrasena").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Rol).HasColumnName("rol").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Municipio)
                .WithMany(m => m.Usuarios)
                .HasForeignKey(e => e.IdMun)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Estado>(entity =>
        {
            entity.ToTable("estados");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(30).IsRequired();
        });

        modelBuilder.Entity<Incidente>(entity =>
        {
            entity.ToTable("incidente");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
        });

        modelBuilder.Entity<Fecha>(entity =>
        {
            entity.ToTable("fechas");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio");
            entity.Property(e => e.FechaFin).HasColumnName("fecha_fin");
        });

        modelBuilder.Entity<Direccion>(entity =>
        {
            entity.ToTable("direccion");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DireccionTexto).HasColumnName("direccion").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Longitud).HasColumnName("longitud").HasPrecision(9, 6);
            entity.Property(e => e.Latitud).HasColumnName("latitud").HasPrecision(9, 6);
        });

        modelBuilder.Entity<Reporte>(entity =>
        {
            entity.ToTable("reportes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdUser).HasColumnName("id_user").IsRequired();
            entity.Property(e => e.IdEstado).HasColumnName("id_estado").IsRequired();
            entity.Property(e => e.IdFecha).HasColumnName("id_fecha");
            entity.Property(e => e.IdIncidente).HasColumnName("id_incidente").IsRequired();
            entity.Property(e => e.IdDireccion).HasColumnName("id_direccion");
            entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasMaxLength(500);
            entity.Property(e => e.Hora).HasColumnName("hora").HasMaxLength(10);
            entity.Property(e => e.Prioridad).HasColumnName("prioridad").HasMaxLength(10);
            entity.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.Reportes)
                .HasForeignKey(e => e.IdUser)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Estado)
                .WithMany(es => es.Reportes)
                .HasForeignKey(e => e.IdEstado)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FechaRef)
                .WithMany(f => f.Reportes)
                .HasForeignKey(e => e.IdFecha)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Incidente)
                .WithMany(inc => inc.Reportes)
                .HasForeignKey(e => e.IdIncidente)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DireccionRef)
                .WithMany(d => d.Reportes)
                .HasForeignKey(e => e.IdDireccion)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Respuesta>(entity =>
        {
            entity.ToTable("respuesta");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdReporte).HasColumnName("id_reporte").IsRequired();
            entity.Property(e => e.IdUser).HasColumnName("id_user").IsRequired();
            entity.Property(e => e.Comentario).HasColumnName("comentario").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Fecha).HasColumnName("fecha").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Reporte)
                .WithMany(r => r.Respuestas)
                .HasForeignKey(e => e.IdReporte)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.Respuestas)
                .HasForeignKey(e => e.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ArchivoAdjunto>(entity =>
        {
            entity.ToTable("archivos_adjuntos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdReporte).HasColumnName("id_reporte").IsRequired();
            entity.Property(e => e.Url).HasColumnName("url").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Tipo).HasColumnName("tipo").HasMaxLength(20);
            entity.Property(e => e.NombreOriginal).HasColumnName("nombre_original").HasMaxLength(255);
            entity.Property(e => e.FechaSubida).HasColumnName("fecha_subida").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Reporte)
                .WithMany(r => r.Archivos)
                .HasForeignKey(e => e.IdReporte)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HistorialEstado>(entity =>
        {
            entity.ToTable("historial_estados");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdReporte).HasColumnName("id_reporte").IsRequired();
            entity.Property(e => e.IdUser).HasColumnName("id_user").IsRequired();
            entity.Property(e => e.EstadoAnterior).HasColumnName("estado_anterior").HasMaxLength(30);
            entity.Property(e => e.EstadoNuevo).HasColumnName("estado_nuevo").HasMaxLength(30).IsRequired();
            entity.Property(e => e.Fecha).HasColumnName("fecha").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Reporte)
                .WithMany(r => r.Historiales)
                .HasForeignKey(e => e.IdReporte)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.Historiales)
                .HasForeignKey(e => e.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
