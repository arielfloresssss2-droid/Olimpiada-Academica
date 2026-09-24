using System.Text;
using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar conexión PostgreSQL con Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=olimpiada_db;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Registrar servicios de la aplicación
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddSingleton<IVerificationService, VerificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IGeminiService, GeminiService>();
builder.Services.AddHttpClient();

// 3. Configurar Controladores y OpenAPI Documentación
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 4. Configurar Autenticación JWT
var jwtSecret = builder.Configuration["JwtSettings:Secret"] 
    ?? "SuperSecretKeyForOlimpiadaAcademicaIncidentsManagementSystem2026!";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Configurar CORS
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5006" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configurar el pipeline HTTP y Documentación Interactiva (Swagger/Scalar)
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.WithTitle("API REST Municipio de Morón - Reportes Urbanos")
           .WithTheme(ScalarTheme.Moon);
});

app.UseStaticFiles();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Redirección amigable a la documentación de la API
app.MapGet("/swagger", () => Results.Redirect("/scalar/v1"));

// Endpoint de prueba de conectividad y estado del sistema
app.MapGet("/", () => new
{
    sistema = "Plataforma Ciudadana de Reportes Urbanos - Municipio de Morón",
    estado = "Operativo",
    documentacionApi = "/scalar/v1 o /swagger",
    version = "1.0.0"
});

app.Run();
