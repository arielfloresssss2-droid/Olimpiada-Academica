import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";
import Captcha from "../../components/Captcha";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      alert("Por favor completa la verificación de seguridad (Captcha) antes de continuar.");
      return;
    }

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
      } else {
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

      <div className="login-brand-corner">
        <p className="login-hero-label">MUNICIPIO DE</p>
        <h2 className="login-hero-city">MORÓN</h2>
      </div>

      <div className="login-card">
        <div className="login-accent-bar" />

        <div className="login-body">
          <div className="login-logo">
            <img src="/logoLogin.png" alt="Logo Municipio de Morón" />
          </div>

          <h1 className="login-school-name">Municipio de Morón</h1>
          <p className="login-school-city">GESTIÓN DE INCIDENTES</p>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span role="img" aria-label="seguridad">
              🛡️
            </span>
            <div className="login-divider-line" />
          </div>

          <h2 className="login-title">Soporte de Incidentes</h2>
          <p className="login-subtitle">Ingresá con tus credenciales de acceso</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">USUARIO / EMAIL</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <img src="/person-log.svg" className="iconos" alt="user" />
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

            {/* Verificación de Seguridad Anti-Spam / Captcha */}
            <Captcha onVerify={setCaptchaVerified} title="Verificación Anti-Bot" />

            <button type="submit" className="login-submit-btn" disabled={!captchaVerified}>
              Iniciar Sesión
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
          <span>Sistema de Soporte de Incidentes · Municipio de Morón</span>
        </div>
      </div>

      <br />
    </div>
  );
}

export default Login;
