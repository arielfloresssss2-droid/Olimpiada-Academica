import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/CambiarContra.css";
import { API_BASE_URL } from "../../config/api";

function CambiarContra() {
  const navigate = useNavigate();

  const [show, setShow] = useState({
    actual: false,
    nueva: false,
    repetir: false,
  });

  const toggle = (field: "actual" | "nueva" | "repetir") =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

    const [showSuccess, setShowSuccess] = useState(false);

    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [repetirPassword, setRepetirPassword] = useState("");

    const handleCambiarPassword = async () => {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

        if (passwordNueva !== repetirPassword) {
            alert("Las contraseñas nuevas no coinciden");
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/api/Usuario/cambiar-password`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idUsuario: usuario.id,
                    passwordActual,
                    passwordNueva
                })
            }
        );

        if (response.ok) {
            setShowSuccess(true);
        } else {
            const mensaje = await response.text();
            alert(mensaje);
        }
    };

  return (
    <div className="cc-wrapper">
      <div className="cc-card">
        {/* Top accent bar */}
        <div className="cc-accent-bar" />

        <div className="cc-content">
          {/* Logo */}
          <div className="cc-logo">
            <img
              src="/logo.svg"
              alt="Logo E.E.S.T. N°6"
              className="cc-logo-img"
            />
          </div>

          {/* School name */}
          <h1 className="cc-school-name">E.E.S.T. N°6 Chacabuco</h1>
          <p className="cc-school-sub">MORÓN</p>

          {/* Divider */}
          <div className="cc-divider">
            <div className="cc-divider-line" />
            <span role="img" aria-label="candado">
              🔐
            </span>
            <div className="cc-divider-line" />
          </div>

          {/* Title */}
          <h2 className="cc-title">Cambiar contraseña</h2>
          <p className="cc-subtitle">Ingresá tu contraseña actual y la nueva</p>

          {/* Form */}
          <form className="cc-form">
            <PasswordField
              label="CONTRASEÑA ACTUAL"
              placeholder="••••••••"
              show={show.actual}
              onToggle={() => toggle("actual")}
              value={passwordActual}
              onChange={setPasswordActual}
            />
            <PasswordField
              label="NUEVA CONTRASEÑA"
              placeholder="••••••••"
              show={show.nueva}
              onToggle={() => toggle("nueva")}
              value={passwordNueva}
              onChange={setPasswordNueva}
            />
            <PasswordField
              label="REPETIR NUEVA CONTRASEÑA"
              placeholder="••••••••"
              show={show.repetir}
              onToggle={() => toggle("repetir")}
              value={repetirPassword}
              onChange={setRepetirPassword}
            />

            <button
                type="button"
                className="cc-btn-primary"
                onClick={handleCambiarPassword}
            >
                Confirmar cambio
            </button>

            <button
              type="button"
              className="cc-btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Volver
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="cc-footer">
          <span>⇄</span>
          <span>Sistema de Gestión Escolar · E.E.S.T. N°6</span>
        </div>
      </div>

      {/* Modal éxito */}
      {showSuccess && (
        <div className="cc-modal-overlay">
          <div className="cc-modal">
            <p className="cc-modal-text">¡Contraseña cambiada correctamente!</p>
            <button
              className="cc-btn-primary"
              onClick={() => navigate("/login")}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordField({
    label,
    placeholder,
    show,
    onToggle,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    show: boolean;
    onToggle: () => void;
    value: string;
    onChange: (value: string) => void;
}) {
  return (
    <div className="cc-field">
      <label className="cc-field-label">{label}</label>
      <div className="cc-field-input">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="cc-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="cc-eye-btn"
          tabIndex={-1}
        >
          <img
            src={show ? "/EyeClose.svg" : "/EyeOpen.svg"}
            alt={show ? "Ocultar" : "Mostrar"}
            className="cc-eye-icon"
          />
        </button>
      </div>
    </div>
  );
}

export default CambiarContra;
