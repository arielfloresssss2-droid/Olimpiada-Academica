namespace Backend.DTOs.Usuario;

public class CambiarPasswordDto
{
    public int IdUsuario { get; set; }
    public string PasswordActual { get; set; } = string.Empty;
    public string PasswordNueva { get; set; } = string.Empty;
}
