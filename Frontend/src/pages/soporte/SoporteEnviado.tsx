import { useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";

function SoporteEnviado() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      {/* MARCA EN ESQUINA INFERIOR IZQUIERDA */}
      <div className="login-brand-corner">
        <p className="login-hero-label">MUNICIPIO DE</p>
        <h2 className="login-hero-city">MORÓN</h2>
      </div>

      {/* PANEL CENTRADO */}
      <div className="login-panel">
        <div className="soporte-enviado-card">
          <div className="login-accent-bar" />

          <div className="login-body">
            <div className="login-logo">
              <img src="/logoLogin.png" alt="Logo Municipio de Morón" />
            </div>
            <p className="login-school-city">GESTIÓN DE INCIDENTES</p>

            <div className="login-divider">
              <div className="login-divider-line" />
              <span role="img" aria-label="check">
                ✅
              </span>
              <div className="login-divider-line" />
            </div>

            <h2 className="soporte-success-title">
              ¡Consulta enviada correctamente!
            </h2>

            <p className="soporte-success-subtitle">
              El equipo de atención al ciudadano de Morón te responderá lo antes posible.
            </p>

            <div className="soporte-buttons-container">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="soporte-btn-secondary"
              >
                Volver al inicio de sesión
              </button>

              <button
                type="button"
                onClick={() => navigate("/support")}
                className="soporte-btn-primary"
              >
                Realizar otra consulta
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

export default SoporteEnviado;