using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;

public class VerificationService : IVerificationService
{
    private class CodeEntry
    {
        public string Code { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    private readonly ConcurrentDictionary<string, CodeEntry> _codigos2FA = new();
    private readonly ConcurrentDictionary<string, CodeEntry> _captchas = new();

    public string GenerarCodigo2FA(string email, string tipo)
    {
        LimpiarExpirados();
        var key = email.Trim().ToLower();
        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        _codigos2FA[key] = new CodeEntry
        {
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };
        return code;
    }

    public bool ValidarCodigo2FA(string email, string code)
    {
        LimpiarExpirados();
        var key = email.Trim().ToLower();
        if (_codigos2FA.TryGetValue(key, out var entry))
        {
            if (DateTime.UtcNow <= entry.ExpiresAt && entry.Code == code.Trim())
            {
                // Consumir el código una vez validado
                _codigos2FA.TryRemove(key, out _);
                return true;
            }
        }
        return false;
    }

    public (string CaptchaId, string SvgImage) GenerarCaptcha()
    {
        LimpiarExpirados();
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var captchaId = Guid.NewGuid().ToString("N");
        var codeBuilder = new StringBuilder();
        for (int i = 0; i < 5; i++)
        {
            codeBuilder.Append(chars[RandomNumberGenerator.GetInt32(0, chars.Length)]);
        }
        var code = codeBuilder.ToString();

        _captchas[captchaId] = new CodeEntry
        {
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        };

        // Generar SVG visual con ruido y distorsión
        var colors = new[] { "#991b1b", "#1e293b", "#0f766e", "#831843", "#1d4ed8", "#4338ca" };
        var svg = new StringBuilder();
        svg.Append("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='46' viewBox='0 0 160 46'>");
        svg.Append("<rect width='160' height='46' fill='#f1f5f9' rx='6' />");

        // Líneas de ruido
        var rand = new Random();
        for (int i = 0; i < 4; i++)
        {
            var x1 = rand.Next(0, 160);
            var y1 = rand.Next(0, 46);
            var x2 = rand.Next(0, 160);
            var y2 = rand.Next(0, 46);
            var color = colors[rand.Next(colors.Length)];
            svg.Append($"<line x1='{x1}' y1='{y1}' x2='{x2}' y2='{y2}' stroke='{color}' stroke-width='1.5' opacity='0.4' />");
        }

        // Puntos de ruido
        for (int i = 0; i < 25; i++)
        {
            var cx = rand.Next(0, 160);
            var cy = rand.Next(0, 46);
            var r = rand.Next(1, 3);
            svg.Append($"<circle cx='{cx}' cy='{cy}' r='{r}' fill='#64748b' opacity='0.3' />");
        }

        // Letras
        for (int i = 0; i < code.Length; i++)
        {
            var ch = code[i];
            var x = 16 + (i * 28);
            var y = rand.Next(26, 34);
            var rot = rand.Next(-18, 18);
            var color = colors[rand.Next(colors.Length)];
            svg.Append($"<text x='{x}' y='{y}' fill='{color}' font-size='24' font-weight='bold' font-family='monospace' transform='rotate({rot} {x} {y})'>{ch}</text>");
        }

        svg.Append("</svg>");
        return (captchaId, svg.ToString());
    }

    public bool ValidarCaptcha(string captchaId, string userInput)
    {
        LimpiarExpirados();
        if (string.IsNullOrWhiteSpace(captchaId) || string.IsNullOrWhiteSpace(userInput))
            return false;

        if (_captchas.TryGetValue(captchaId, out var entry))
        {
            if (DateTime.UtcNow <= entry.ExpiresAt && 
                string.Equals(entry.Code, userInput.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                _captchas.TryRemove(captchaId, out _);
                return true;
            }
        }
        return false;
    }

    private void LimpiarExpirados()
    {
        var now = DateTime.UtcNow;
        foreach (var kvp in _codigos2FA)
        {
            if (kvp.Value.ExpiresAt < now)
                _codigos2FA.TryRemove(kvp.Key, out _);
        }
        foreach (var kvp in _captchas)
        {
            if (kvp.Value.ExpiresAt < now)
                _captchas.TryRemove(kvp.Key, out _);
        }
    }
}
