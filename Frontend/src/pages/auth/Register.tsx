import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/auth/Login-Register.css";
import { API_BASE_URL } from "../../config/api";
import Captcha from "../../components/Captcha";
import {
  calculateExpiration,
  generatePasscode,
  saveRegisterSession,
  sendRegisterCodeEmail,
} from "../../services/emailService";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaVerified) {
      setError("Por favor completá la verificación de seguridad (Captcha).");
      return;
    }

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanNombre || !cleanApellido) {
      setError("Por favor completá tu nombre y apellido");
      return;
    }

    if (!cleanEmail) {
      setError("Por favor ingresá tu correo electrónico");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Ingresá un correo electrónico válido");
      return;
    }

    if (!password) {
      setError("Ingresá una contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      // 1. Comprobar si el correo ya está registrado en el backend
      const checkRes = await fetch(`${API_BASE_URL}/api/Auth/comprobar-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!checkRes.ok) {
        const errorText = await checkRes.text();
        setError(errorText || "Ya existe una cuenta con ese correo electrónico");
        setLoading(false);
        return;
      }

      // 2. Generar código de verificación de 6 dígitos con validez de 15 minutos
      const passcode = generatePasscode();
      const { expiresAt, timeFormatted } = calculateExpiration(15);

      // 3. Enviar correo usando EmailJS con el template template_4954e4b
      const emailRes = await sendRegisterCodeEmail(
        cleanEmail,
        cleanNombre,
        cleanApellido,
        passcode,
        timeFormatted
      );

      if (!emailRes.success) {
        setError(
          emailRes.error ||
            "No se pudo enviar el correo de verificación. Intentá nuevamente."
        );
        setLoading(false);
        return;
      }

      // 4. Guardar datos temporales en la sesión (la cuenta se creará tras confirmar el código)
      saveRegisterSession({
        nombre: cleanNombre,
        apellido: cleanApellido,
        email: cleanEmail,
        password,
        passcode,
        expiresAt,
        timeFormatted,
      });

      // 5. Redirigir a la pantalla de aviso de correo enviado
      navigate("/register/sent", {
        state: { email: cleanEmail },
      });
    } catch (err: any) {
      console.error(err);
      setError("Error de conexión con el servidor. Intentá de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <br />

      <div className="login-card">
        <div className="login-accent-bar" />

        <div className="login-body">
          <div className="login-logo">
            <img src="/logo.svg" alt="Logo Municipio de Morón" />
          </div>

          <h1 className="login-school-name">Municipio de Morón</h1>

          <p className="login-school-city">GESTIÓN DE INCIDENTES</p>

          <div className="login-divider">
            <div className="login-divider-line" />

            <span role="img" aria-label="registro">
              📋
            </span>

            <div className="login-divider-line" />
          </div>

          <h2 className="login-title">Crear Cuenta</h2>

          <p className="login-subtitle">Completá tus datos para registrarte en el sistema de incidentes</p>

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

            {error && <p className="forgot-error-text">{error}</p>}

            {/* Verificación Anti-Bot Captcha */}
            <Captcha onVerify={setCaptchaVerified} title="Verificación Anti-Bot Registro" />

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading || !captchaVerified}
              style={{
                opacity: loading || !captchaVerified ? 0.7 : 1,
                cursor: loading || !captchaVerified ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Enviando código..." : "Crear cuenta"}
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

          <span>Sistema de Soporte de Incidentes · Municipio de Morón</span>
        </div>
      </div>

      <p className="login-bottom-note">
        Sistema oficial de gestión y reporte de incidentes · Morón
      </p>

      <br />
    </div>
  );
}

export default Register;
