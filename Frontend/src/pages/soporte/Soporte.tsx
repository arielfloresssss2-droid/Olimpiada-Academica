import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/Login-Register.css";

function Soporte() {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    asunto: "",
    descripcion: "",
    aceptaTerminos: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nombreCompleto ||
      !formData.email ||
      !formData.asunto ||
      !formData.descripcion
    ) {
      alert("Por favor completá todos los campos");
      return;
    }

    if (!formData.aceptaTerminos) {
      alert("Debes aceptar los términos para enviar la consulta");
      return;
    }

    console.log("Formulario enviado:", formData);

    navigate("/support-success");
  };

  return (
    <div className="login-page">
      <div className="login-brand-corner">
        <p className="login-hero-label">MUNICIPIO DE</p>
        <h2 className="login-hero-city">MORÓN</h2>
      </div>

      <div className="login-panel">
        <div className="soporte-card">
          <div className="login-accent-bar" />

          <div className="login-body">
            <div className="login-logo">
              <img src="/logoLogin.png" alt="Logo Municipio de Morón" />
            </div>
            <p className="login-school-city">GESTIÓN DE INCIDENTES</p>

            <div className="soporte-divider-top">
              <div className="soporte-divider-line-full" />
            </div>

            <h2 className="soporte-title">Soporte y Atención Ciudadana</h2>

            <p className="login-subtitle">
              Describí tu consulta o inconveniente y el equipo de soporte lo revisará a la brevedad.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">NOMBRE COMPLETO</label>

                <div className="login-input-wrapper">
                  <input
                    className="login-input"
                    type="text"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">EMAIL</label>

                <div className="login-input-wrapper">
                  <input
                    className="login-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">ASUNTO</label>

                <div className="login-input-wrapper">
                  <input
                    className="login-input"
                    type="text"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    placeholder="Asunto"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">DESCRIPCIÓN</label>

                <div className="login-input-wrapper">
                  <textarea
                    className="soporte-textarea"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe tu problema"
                  />
                </div>
              </div>

              <label className="login-remember">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                />

                <span className="login-remember-text">
                  Acepto que mis datos sean utilizados para responder a esta
                  solicitud.
                </span>
              </label>

              <button type="submit" className="login-submit-btn">
                Enviar consulta
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Soporte;