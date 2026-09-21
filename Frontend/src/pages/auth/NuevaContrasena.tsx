import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";
import { clearResetSession, getResetSession } from "../../services/emailService";

function NuevaContrasena() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = getResetSession();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const email = stateEmail || session?.email;

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si no hay correo o la sesión no fue verificada, volver al inicio
    if (!email || !session?.verified) {
      navigate("/forgot-password");
    }
  }, [email, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Ingresá tu nueva contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nuevaPassword: password,
        }),
      });

      if (response.ok) {
        clearResetSession();
        navigate("/forgot-password/success");
      } else {
        const errorText = await response.text();
        setError(errorText || "No se pudo actualizar la contraseña");
      }
    } catch {
      setError("Error de conexión con el servidor. Intentá de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* MARCA EN ESQUINA INFERIOR IZQUIERDA */}
      <div className="login-brand-corner">
        <p className="login-hero-label">MUNICIPIO DE</p>
        <h2 className="login-hero-city">MORÓN</h2>
      </div>

      {/* PANEL CENTRADO */}
      <div className="login-panel">
        <div className="login-card">
          <div className="login-accent-bar" />

          <div className="login-body">
            <div className="login-logo">
              <img src="/logoLogin.png" alt="Logo Municipio de Morón" />
            </div>

            <h2 className="login-title">Nueva contraseña</h2>

            <p className="login-subtitle">
              Elegí una contraseña nueva para tu cuenta
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">CONTRASEÑA NUEVA</label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <img src="/lock.svg" alt="contraseña" />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                    tabIndex={-1}
                  >
                    <img
                      src={showPassword ? "/EyeClose.svg" : "/EyeOpen.svg"}
                      alt={showPassword ? "Ocultar" : "Mostrar"}
                    />
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">CONFIRMAR CONTRASEÑA</label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <img src="/lock.svg" alt="confirmar contraseña" />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="login-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Actualizando contraseña..." : "Cambiar contraseña"}
              </button>
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
      </div>
    </div>
  );
}

export default NuevaContrasena;