import { useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";

function ContrasenaActualizada() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <br />

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
          <span>Sistema de Gestión Escolar · E.E.S.T. N°6</span>
        </div>
      </div>

      <br />
    </div>
  );
}

export default ContrasenaActualizada;