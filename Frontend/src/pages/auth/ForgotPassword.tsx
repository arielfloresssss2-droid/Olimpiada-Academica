import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";
import {
  calculateExpiration,
  generatePasscode,
  saveResetSession,
  sendResetCodeEmail,
} from "../../services/emailService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Ingresá tu correo para continuar");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Ingresá un correo electrónico válido");
      return;
    }

    setLoading(true);

    try {
      // 1. Verificar si el usuario existe en el sistema
      const verifyRes = await fetch(`${API_BASE_URL}/api/Auth/verificar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!verifyRes.ok) {
        if (verifyRes.status === 404) {
          setError("No encontramos ninguna cuenta activa asociada a este correo");
        } else {
          const msg = await verifyRes.text();
          setError(msg || "Error al verificar el correo");
        }
        setLoading(false);
        return;
      }

      // 2. Generar código de 6 dígitos y calcular expiración a 15 min
      const passcode = generatePasscode();
      const { expiresAt, timeFormatted } = calculateExpiration(15);

      // 3. Enviar correo mediante EmailJS
      const emailRes = await sendResetCodeEmail(
        cleanEmail,
        passcode,
        timeFormatted
      );

      if (!emailRes.success) {
        setError(
          emailRes.error ||
            "No se pudo enviar el correo de recuperación. Intentá nuevamente."
        );
        setLoading(false);
        return;
      }

      // 4. Guardar sesión de recuperación
      saveResetSession({
        email: cleanEmail,
        passcode,
        expiresAt,
        timeFormatted,
        verified: false,
      });

      // 5. Redirigir a la pantalla de confirmación de envío
      navigate("/forgot-password/sent", {
        state: { email: cleanEmail },
      });
    } catch (err: any) {
      setError("Error de conexión con el servidor. Intentá de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <br />

      <div className="login-card">
        <div className="login-accent-bar" />

        <div className="login-body">
          <div className="login-logo">
            <img src="/logo.svg" alt="Logo Municipio de Morón" />
          </div>

          <h1 className="login-school-name">Municipio de Morón</h1>
          <p className="login-school-city">GESTIÓN DE INCIDENTES</p>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span role="img" aria-label="recuperar contraseña">
              🔑
            </span>
            <div className="login-divider-line" />
          </div>

          <h2 className="login-title">Recuperar contraseña</h2>

          <p className="login-subtitle">
            Ingresá tu correo y te enviamos un código para continuar
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">CORREO ELECTRÓNICO</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <img
                    src="/person-log.svg"
                    className="iconos"
                    alt="correo"
                  />
                </span>

                <input
                  type="email"
                  placeholder="usuario@moron.gob.ar"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="forgot-error-text">{error}</p>}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Enviando código..." : "Continuar"}
            </button>

            <p className="login-help-text">
              <Link to="/login" className="login-help-link">
                ‹ Volver al inicio de sesión
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

export default ForgotPassword;