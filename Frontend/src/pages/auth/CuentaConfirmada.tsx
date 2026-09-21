import { useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";

function CuentaConfirmada() {
  const navigate = useNavigate();

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
            <div className="forgot-icon-circle forgot-icon-circle--success">
              <span role="img" aria-label="cuenta confirmada">
                ✅
              </span>
            </div>

            <h2 className="soporte-success-title">¡Cuenta creada con éxito!</h2>
            <p className="soporte-success-subtitle">
              Tu correo ha sido verificado y tu cuenta fue activada. Ya podés
              iniciar sesión con tu correo y contraseña.
            </p>

            <div className="soporte-buttons-container">
              <button
                type="button"
                className="login-submit-btn"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </button>

              <p className="login-help-text">
                <button
                  type="button"
                  className="login-help-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={() => navigate("/login")}
                >
                  ‹ Volver al inicio de sesión
                </button>
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

export default CuentaConfirmada;