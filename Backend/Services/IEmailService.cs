namespace Backend.Services;

public interface IEmailService
{
    Task EnviarNotificacionCambioEstado(
        string emailDestino,
        string nombreUsuario,
        int reporteId,
        string tituloReporte,
        string estadoAnterior,
        string estadoNuevo
    );
}
