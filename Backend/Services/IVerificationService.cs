namespace Backend.Services;

public interface IVerificationService
{
    string GenerarCodigo2FA(string email, string tipo);
    bool ValidarCodigo2FA(string email, string code);
    (string CaptchaId, string SvgImage) GenerarCaptcha();
    bool ValidarCaptcha(string captchaId, string userInput);
}
