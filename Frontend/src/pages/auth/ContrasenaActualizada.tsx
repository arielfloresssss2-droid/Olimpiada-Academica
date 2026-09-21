import { useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";

function ContrasenaActualizada() {
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
              <span role="img" aria-label="contraseña actualizada">
                ✅
              </span>
            </div>

            <h2 className="soporte-success-title">Contraseña actualizada</h2>
            <p className="soporte-success-subtitle">
              Tu contraseña se cambió correctamente. Ya podés ingresar al
              sistema.
            </p>

            <div className="soporte-buttons-container">
              <button
                type="button"
                className="login-submit-btn"
                onClick={() => navigate("/login")}
              >
                Ir al inicio de sesión
              </button>
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

export default ContrasenaActualizada;