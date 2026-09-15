import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import {
  calculateExpiration,
  generatePasscode,
  getResetSession,
  markResetSessionVerified,
  saveResetSession,
  sendResetCodeEmail,
} from "../../services/emailService";

function VerificarCodigo() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const session = getResetSession();
  const email = stateEmail || session?.email;

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Si no hay sesión ni correo, volver al inicio del proceso
    if (!email && !session) {
      navigate("/forgot-password");
    }
  }, [email, session, navigate]);

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

    const currentSession = getResetSession();

    if (!currentSession) {
      setError("No se encontró una solicitud activa. Por favor solicitá un nuevo código.");
      setLoading(false);
      return;
    }

    // Verificar si el código ya expiró (15 minutos)
    if (Date.now() > currentSession.expiresAt) {
      setError(
        "El código ha expirado (validez de 15 minutos). Por favor solicitá uno nuevo."
      );
      setLoading(false);
      return;
    }

    // Verificar si el código coincide
    if (currentSession.passcode !== code) {
      setError("El código ingresado es incorrecto");
      setLoading(false);
      return;
    }

    // Código válido -> marcar como verificado y continuar
    markResetSessionVerified();
    setLoading(false);

    navigate("/forgot-password/reset", {
      state: { email: currentSession.email, code },
    });
  };

  const handleReenviarCodigo = async () => {
    if (!email) {
      navigate("/forgot-password");
      return;
    }

    setResending(true);
    setError("");
    setResendMessage("");

    try {
      const passcode = generatePasscode();
      const { expiresAt, timeFormatted } = calculateExpiration(15);

      const emailRes = await sendResetCodeEmail(email, passcode, timeFormatted);

      if (emailRes.success) {
        saveResetSession({
          email,
          passcode,
          expiresAt,
          timeFormatted,
          verified: false,
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

          <h2 className="login-title">Verificá el código</h2>
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
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Verificando..." : "Continuar"}
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
              <Link to="/forgot-password" className="login-help-link">
                ‹ Usar otro correo
              </Link>
            </p>
          </form>
        </div>

        <div className="login-footer">
          <span>⇄</span>
          <span>Sistema de Gestión Escolar · E.E.S.T. N°6</span>
        </div>
      </div>

      <br />
    </div>
  );
}

export default VerificarCodigo;