import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { getResetSession } from "../../services/emailService";

function CodigoEnviado() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const session = getResetSession();
  const email = stateEmail || session?.email;

  const handleContinuar = () => {
    navigate("/forgot-password/verify", { state: { email } });
  };

  return (
    <div className="login-page">
      {/* MARCA EN ESQUINA INFERIOR IZQUIERDA (Opcional) */}
      <div className="login-brand-corner">
        <p className="login-hero-label">MUNICIPIO DE</p>
        <h2 className="login-hero-city">MORÓN</h2>
      </div>

      {/* PANEL CENTRADO */}
      <div className="login-panel">
        <div className="login-card">
          <div className="login-accent-bar" />

          <div className="login-body">
            <div className="forgot-icon-circle forgot-icon-circle--info">
              <span role="img" aria-label="correo enviado">
                ✉️
              </span>
            </div>

            <h2 className="soporte-success-title">Revisá tu correo</h2>
            <p className="soporte-success-subtitle">
              {email
                ? `Te enviamos un código de 6 dígitos a ${email}`
                : "Te enviamos un código de 6 dígitos a tu correo"}
            </p>

            <div className="soporte-buttons-container">
              <button
                type="button"
                className="login-submit-btn"
                onClick={handleContinuar}
              >
                Continuar
              </button>

              <p className="login-help-text">
                <Link to="/forgot-password" className="login-help-link">
                  Usar otro correo
                </Link>
              </p>
            </div>
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

export default CodigoEnviado;