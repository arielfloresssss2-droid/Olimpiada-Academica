import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";
import {
  calculateExpiration,
  clearRegisterSession,
  generatePasscode,
  getRegisterSession,
  saveRegisterSession,
  sendRegisterCodeEmail,
} from "../../services/emailService";

function VerificarRegistro() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const session = getRegisterSession();
  const email = stateEmail || session?.email;

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Si no hay datos de registro temporal, volver al registro
    if (!session || !session.email) {
      navigate("/register");
    }
  }, [session, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendMessage("");

    const code = digits.join("");

    if (code.length !== 6) {
      setError("Completá los 6 dígitos del código");
      return;
    }

    setLoading(true);

    const currentSession = getRegisterSession();

    if (!currentSession) {
      setError("No se encontró una sesión de registro activa. Por favor completá el registro nuevamente.");
      setLoading(false);
      return;
    }

    // 1. Verificar si el código expiró (15 minutos)
    if (Date.now() > currentSession.expiresAt) {
      setError("El código ha expirado (validez de 15 minutos). Por favor solicitá uno nuevo.");
      setLoading(false);
      return;
    }

    // 2. Verificar si el código ingresado coincide
    if (currentSession.passcode !== code) {
      setError("El código ingresado es incorrecto");
      setLoading(false);
      return;
    }

    // 3. Código verificado con éxito -> Ahora sí registramos al usuario en la base de datos
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: currentSession.nombre,
          apellido: currentSession.apellido,
          email: currentSession.email,
          password: currentSession.password,
        }),
      });

      if (response.ok) {
        // Limpiamos la sesión temporal de registro
        clearRegisterSession();
        setLoading(false);
        alert("¡Tu cuenta ha sido creada con éxito! Ahora podés iniciar sesión.");
        navigate("/register/success");
      } else {
        const errorText = await response.text();
        setError(errorText || "Error al registrar la cuenta");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor para crear la cuenta.");
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    const currentSession = getRegisterSession();
    if (!currentSession) {
      navigate("/register");
      return;
    }

    setResending(true);
    setError("");
    setResendMessage("");

    try {
      const passcode = generatePasscode();
      const { expiresAt, timeFormatted } = calculateExpiration(15);

      const emailRes = await sendRegisterCodeEmail(
        currentSession.email,
        currentSession.nombre,
        currentSession.apellido,
        passcode,
        timeFormatted
      );

      if (emailRes.success) {
        saveRegisterSession({
          ...currentSession,
          passcode,
          expiresAt,
          timeFormatted,
        });
        setDigits(Array(6).fill(""));
        inputsRef.current[0]?.focus();
        setResendMessage(`Te enviamos un nuevo código válido hasta las ${timeFormatted}.`);
      } else {
        setError(emailRes.error || "No se pudo reenviar el código. Intenta de nuevo.");
      }
    } catch {
      setError("Error al reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">
      <br />

      <div className="login-card">
        <div className="login-accent-bar" />

        <div className="login-body">
          <div className="login-logo">
            <img src="/logo.svg" alt="Logo E.E.S.T. N°6" />
          </div>

          <h2 className="login-title">Confirmá tu correo</h2>
          <p className="login-subtitle">
            {email
              ? `Ingresá el código de 6 dígitos que enviamos a ${email}`
              : "Ingresá el código de 6 dígitos que te enviamos"}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="forgot-code-inputs">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="forgot-code-box"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            {error && <p className="forgot-error-text">{error}</p>}
            {resendMessage && (
              <p
                className="forgot-error-text"
                style={{ color: "#27ae60" }}
              >
                {resendMessage}
              </p>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Confirmando cuenta..." : "Confirmar cuenta"}
            </button>

            <div className="login-help-text" style={{ textAlign: "center", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={resending}
                className="login-help-link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {resending ? "Reenviando código..." : "¿No recibiste el código? Reenviar"}
              </button>
            </div>

            <p className="login-help-text">
              <Link to="/register" className="login-help-link">
                ‹ Volver al registro
              </Link>
            </p>
          </form>
        </div>

        <div className="login-footer">
          <span>⇄</span>
          <span>Sistema de Soporte de Incidentes · Municipio de Morón</span>
        </div>
      </div>

      <p className="login-bottom-note">
        Sistema oficial de reporte y gestión de incidentes · Morón
      </p>

      <br />
    </div>
  );
}

export default VerificarRegistro;
