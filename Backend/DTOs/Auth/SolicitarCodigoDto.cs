namespace Backend.DTOs.Auth;

public class SolicitarCodigoDto
{
    public string Email { get; set; } = string.Empty;
    public string Tipo { get; set; } = "registro"; // "registro" o "recuperacion"
}

public class VerificarCodigoDto
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class CaptchaResponseDto
{
    public string CaptchaId { get; set; } = string.Empty;
    public string SvgImage { get; set; } = string.Empty;
}

public class ValidarCaptchaDto
{
    public string CaptchaId { get; set; } = string.Empty;
    public string UserInput { get; set; } = string.Empty;
}
