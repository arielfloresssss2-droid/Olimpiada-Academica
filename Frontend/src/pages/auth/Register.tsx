import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [nombre, setNombre] = useState("");

  const [apellido, setApellido] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [repeatPassword, setRepeatPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      alert("Las contraseñas no coinciden");

      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nombre,
          apellido,
          email,
          password,
        }),
      });

      if (response.ok) {
        alert("Usuario registrado");

        navigate("/login");
      } else {
        const error = await response.text();

        alert(error);
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

            <span role="img" aria-label="registro">
              📋
            </span>

            <div className="login-divider-line" />
          </div>

          <h2 className="login-title">Crear Cuenta</h2>

          <p className="login-subtitle">Completá tus datos para registrarte</p>

          <form className="login-form" onSubmit={handleRegister}>
            {/* Nombre + Apellido */}

            <div className="register-name-row">
              <div className="login-field">
                <label className="login-label">NOMBRE</label>

                <div className="login-input-wrapper">
                  <input
                    type="text"
                    placeholder="Juan"
                    className="login-input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">APELLIDO</label>

                <div className="login-input-wrapper">
                  <input
                    type="text"
                    placeholder="García"
                    className="login-input"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* EMAIL */}

            <div className="login-field">
              <label className="login-label">EMAIL</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <img src="/email.svg" className="iconos" alt="email" />
                </span>

                <input
                  type="email"
                  placeholder="usuario@gmail.com"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="login-field">
              <label className="login-label">CONTRASEÑA</label>

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

            {/* REPEAT PASSWORD */}

            <div className="login-field">
              <label className="login-label">REPETIR CONTRASEÑA</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <img src="/lock.svg" alt="repetir contraseña" />
                </span>

                <input
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="login-input"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="login-eye-btn"
                  tabIndex={-1}
                >
                  <img
                    src={showRepeatPassword ? "/EyeClose.svg" : "/EyeOpen.svg"}
                    alt={showRepeatPassword ? "Ocultar" : "Mostrar"}
                  />
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn">
              Crear cuenta
            </button>

            <p className="login-help-text">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="register-login-link login-help-link">
                Iniciá sesión
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

export default Register;
