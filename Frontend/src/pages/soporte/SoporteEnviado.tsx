import { useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";

function SoporteEnviado() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <br />
      <div className="soporte-enviado-card">
        <div className="login-accent-bar" />

        <div className="login-body">
          <div className="login-logo">
            <img src="/logo.svg" alt="Logo E.E.S.T. N°6" />
          </div>

          <h1 className="login-school-name">E.E.S.T. N°6 Chacabuco</h1>
          <p className="login-school-city">MORÓN</p>

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
            Te responderemos lo antes posible.
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
          <span>Sistema de Gestión Escolar · E.E.S.T. N°6</span>
        </div>
      </div>

      <p className="login-bottom-note">
        Solo para uso de alumnos, docentes y personal autorizado
      </p>
      <br />
    </div>
  );
}

export default SoporteEnviado;
