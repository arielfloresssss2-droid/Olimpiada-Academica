using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Backend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task EnviarNotificacionCambioEstado(
        string emailDestino,
        string nombreUsuario,
        int reporteId,
        string tituloReporte,
        string estadoAnterior,
        string estadoNuevo
    )
    {
        var enabled = _config.GetValue<bool>("EmailSettings:Enabled");
        var host = _config["EmailSettings:Host"] ?? "";

        // En desarrollo o sin SMTP configurado: loggear amigablemente sin romper
        if (!enabled || string.IsNullOrWhiteSpace(host))
        {
            _logger.LogInformation(
                "[EMAIL NOTIFICACIÓN MUNICIPALIDAD MORÓN]\n" +
                "  -> Para: {Email} ({Nombre})\n" +
                "  -> Asunto: Actualización de Reporte #{Id}\n" +
                "  -> Incidente: '{Titulo}'\n" +
                "  -> Transición: '{Anterior}' ===> '{Nuevo}'",
                emailDestino, nombreUsuario, reporteId, tituloReporte, estadoAnterior, estadoNuevo);
            return;
        }

        try
        {
            var port = _config.GetValue<int>("EmailSettings:Port", 587);
            var user = _config["EmailSettings:User"] ?? "";
            var password = _config["EmailSettings:Password"] ?? "";
            var from = _config["EmailSettings:From"] ?? "noreply@moron.gob.ar";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Municipio de Morón - Atención Ciudadana", from));
            message.To.Add(new MailboxAddress(nombreUsuario, emailDestino));
            message.Subject = $"Municipalidad de Morón — Reporte #{reporteId} actualizado a '{estadoNuevo}'";

            var builder = new BodyBuilder
            {
                HtmlBody = $"""
                    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; background:#0f172a; color:#f8fafc; padding:32px; border-radius:12px; border:1px solid #1e293b;">
                      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                        <h2 style="color:#38bdf8; margin:0;">🏛️ Municipalidad de Morón</h2>
                      </div>
                      <h3 style="color:#ffffff; margin-top:0;">Actualización de Estado de tu Reporte #{reporteId}</h3>
                      <p style="color:#cbd5e1; font-size:15px;">Estimado/a <strong>{nombreUsuario}</strong>,</p>
                      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
                        Le informamos que el reporte ciudadano registrado como <strong>"{tituloReporte}"</strong> ha tenido una actualización en su seguimiento municipal:
                      </p>
                      
                      <div style="background:#1e293b; padding:18px; border-radius:8px; margin:20px 0; border:1px solid #334155; text-align:center;">
                        <span style="color:#94a3b8; font-size:14px; text-decoration:line-through;">{estadoAnterior}</span>
                        <span style="color:#38bdf8; font-size:20px; margin:0 14px;">➔</span>
                        <span style="color:#22c55e; font-size:16px; font-weight:bold; background:#064e3b; padding:6px 14px; border-radius:6px;">{estadoNuevo}</span>
                      </div>

                      <p style="color:#94a3b8; font-size:13px; line-height:1.5;">
                        Podés consultar el historial completo y detalles adicionales ingresando a la plataforma ciudadana con tu cuenta de usuario.
                      </p>
                      
                      <hr style="border:none; border-top:1px solid #334155; margin:24px 0;" />
                      
                      <p style="color:#64748b; font-size:12px; text-align:center; margin:0;">
                        Este es un mensaje automático de la Dirección de Gestión y Atención Ciudadana de la Municipalidad de Morón.
                      </p>
                    </div>
                """
            };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            if (!string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(password))
            {
                await client.AuthenticateAsync(user, password);
            }
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Notificación por correo despachada exitosamente a {Email} para el reporte #{Id}", emailDestino, reporteId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar correo de notificación a {Email} para el reporte #{Id}", emailDestino, reporteId);
        }
    }
}
