import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/perfil/Perfil.css";
import { API_BASE_URL } from "../../config/api";

function Perfil() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showContactConfirm, setShowContactConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const navigate = useNavigate();

    const manejarEliminarCuenta = async () => {
      
      if (!password) {
        alert('Por favor, ingresa tu contraseña para confirmar.');
        return;
      }

      const confirmar = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.');
      if (!confirmar) return;

      setCargando(true);

      try {
        // Extraemos el Token y el objeto Usuario guardados en tu Login
        const token = localStorage.getItem("token");
        const usuarioRaw = localStorage.getItem("usuario");

        if (!usuarioRaw || !token) {
          throw new Error('Sesión inválida. Por favor, vuelve a iniciar sesión.');
        }
        
        // Parseamos el JSON para obtener el ID del usuario (.id o .Id)
        const usuarioObjeto = JSON.parse(usuarioRaw);
        const usuarioId = usuarioObjeto.id || usuarioObjeto.Id; 

        if (!usuarioId) {
          throw new Error('No se pudo encontrar el ID del usuario en la sesión.');
        }

        const url = `${API_BASE_URL}/api/Usuario/eliminar/${usuarioId}`;
        
        const respuesta = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Tu JWT obligatorio
          },
          body: JSON.stringify({ password: password }) // Coincide con tu EliminarCuentaDTO
        });

        if (!respuesta.ok) {
          // Captura respuestas de .NET como BadRequest("Contraseña incorrecta")
          const errorTexto = await respuesta.text();
          throw new Error(errorTexto || 'Error al eliminar la cuenta');
        }

        // Si tu .NET responde Ok(new { mensaje = "..." })
        const datosBff = await respuesta.json();
        alert(datosBff.mensaje);

        // Cerramos el modal de confirmación antes de salir
        setShowDeleteConfirm(false);

        // Limpiamos el localStorage y redirigimos al Login
        localStorage.clear();
        window.location.href = '/login'; 

      } catch (error: any) {
        console.error(error);
        alert(error?.message || "Error al eliminar la cuenta");
      } finally {
        setCargando(false);
      }
    };
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Usuario/logout`, {
                method: "POST",
            });

            if (response.ok) {
                localStorage.removeItem("usuario");
                navigate("/login");
            } else {
                alert("No se pudo cerrar la sesión.");
            }
        } catch (error) {
            console.error(error);
            alert("Error del servidor.");
        }
    };

  return (
    <div className="perfil-wrapper">
      <div className="perfil-card">
        <div className="perfil-avatar">
          <img src="/user.svg" alt="user" />
        </div>

        <h1 className="perfil-nombre">
          {usuario.nombre} {usuario.apellido}
        </h1>

        <p className="perfil-email">{usuario.email}</p>

        <div className="perfil-stats">
          <div className="perfil-stat">
            <span className="perfil-stat-label">
              Cant. de pedidos realizados:
            </span>
            <span className="perfil-stat-value">28</span>
          </div>

          <div className="perfil-stat">
            <span className="perfil-stat-label">Rol</span>
            <span className="perfil-stat-value">{usuario.rol}</span>
          </div>

          <div className="perfil-stat">
            <span className="perfil-stat-label">Reservas activas</span>
            <span className="perfil-stat-value">3</span>
          </div>
        </div>

        {/* Botones */}
        <div className="perfil-actions">
          <button
            className="perfil-btn perfil-btn-primary"
            onClick={() => navigate("/cambiar-contra")}
          >
            Cambiar contraseña
          </button>

            <button
              className="perfil-btn perfil-btn-primary"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>

          <button
            className="perfil-btn perfil-btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Borrar cuenta
          </button>
        </div>

        {/* Soporte */}
        <div className="perfil-support">
          <p className="login-help-text">
            ¿Necesitás ayuda?{" "}
            <button
              className="login-help-link"
              onClick={() => setShowContactConfirm(true)}
            >
              Contactar al soporte
            </button>
          </p>
        </div>
      </div>

      {/* Modal confirmar borrar cuenta */}
      {showContactConfirm && (
        <div className="perfil-modal-overlay">
          <div className="perfil-modal">
            <p className="perfil-modal-text">
              Ir a esta seccion cerrara la sesion automaticamente.
              <br />
              ¿Desea continuar de todas formas?
            </p>

            <div className="perfil-modal-actions">
              <button
                className="perfil-btn perfil-btn-secondary"
                onClick={() => setShowContactConfirm(false)}
              >
                Cancelar
              </button>

              <button
                className="perfil-btn perfil-btn-danger"
                onClick={() => navigate("/support")}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar borrar cuenta */}
      {showDeleteConfirm && (
        <div className="perfil-modal-overlay">
          <div className="perfil-modal">
            <p className="perfil-modal-text">
              ¿Estás seguro que querés borrar tu cuenta? Esta acción es
              irreversible.
            </p>

                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={cargando} 
                />

                <div className="perfil-modal-actions">
                  <button
                    type="button"
                    className="perfil-btn perfil-btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={cargando} 
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="perfil-btn perfil btn-secondary"
                    onClick={manejarEliminarCuenta} 
                    disabled={cargando}       
                  >
                    {cargando ? 'Eliminando...' : 'Confirmar'}
                  </button>
                </div>
            </div>
          </div>
        
      )}
    </div>
  );
}

export default Perfil;
