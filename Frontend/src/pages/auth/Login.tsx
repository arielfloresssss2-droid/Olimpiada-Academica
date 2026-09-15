import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        console.log("Datos recibidos del login:", data);
          localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));

      if (data.rol === "Admin") {
        navigate("/admin");
      } else if (data.rol === "Alumno") {
        navigate("/Dashboard");
      }
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error(error);
      alert("Error del servidor");
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

          <h1 className="login-school-name">E.E.S.T. N°6 Chacabuco</h1>
          <p className="login-school-city">MORÓN</p>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span role="img" aria-label="comedor">
              🍽️
            </span>
            <div className="login-divider-line" />
          </div>

          <h2 className="login-title">Sistema de Reporte de Incidentes</h2>
          <p className="login-subtitle">Ingresá con tu cuenta escolar</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">USUARIO / EMAIL</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <img src="/person-log.svg" className="iconos" alt="user" />
                </span>
                <input
                  type="email"
                  placeholder="usuario@escuela.edu"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">CONTRASEÑA</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <img src="/lock.svg" alt="user" />
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

            <div className="login-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="login-remember-text">Recordarme</span>
              </label>
              <Link to="/forgot-password" className="login-forgot">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="login-submit-btn">
              Ingresar al Comedor
            </button>

            <p className="login-help-text">
              ¿Necesitás ayuda?{" "}
              <Link to="/support" className="login-help-link">
                Contactá al soporte
              </Link>
            </p>

            <p className="login-help-text">
              ¿No tienes cuenta?{" "}
              <Link to="/Register" className="login-help-link">
                Registrarse
              </Link>
            </p>
          </form>
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

export default Login;
