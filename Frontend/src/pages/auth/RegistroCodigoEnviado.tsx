import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { getRegisterSession } from "../../services/emailService";

function RegistroCodigoEnviado() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const session = getRegisterSession();
  const email = stateEmail || session?.email;

  const handleContinuar = () => {
    navigate("/register/verify", { state: { email } });
  };

  return (
    <div className="login-page">
      <br />

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
              ? `Te enviamos un código de 6 dígitos a ${email} para verificar tu correo y habilitar tu cuenta en el sistema de incidentes de Morón.`
              : "Te enviamos un código de 6 dígitos para verificar tu correo y habilitar tu cuenta en el sistema de incidentes de Morón."}
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
              <Link to="/register" className="login-help-link">
                ‹ Modificar datos o volver
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

      <br />
    </div>
  );
}

export default RegistroCodigoEnviado;
