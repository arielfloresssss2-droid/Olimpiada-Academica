
import { useEffect, useState } from "react";
import {
  PlusCircle,
  UtensilsCrossed,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";

import "../../styles/admin/GestionarMenu.css";
import { API_BASE_URL } from "../../config/api";

interface Menu {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponibilidad: number;
  fecha: string;
  disponible: boolean;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
}

interface MenuForm {
  nombre: string;
  descripcion: string;
  precio: string;
  disponibilidad: string;
}

interface ProductoForm {
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: string;
  disponible: boolean;
}

const formularioInicial: MenuForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  disponibilidad: "",
};

const productoInicial: ProductoForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  disponible: true,
};

function GestionarMenu() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [formulario, setFormulario] =
    useState<MenuForm>(formularioInicial);

  const [productoForm, setProductoForm] =
    useState<ProductoForm>(productoInicial);

  const [menuEditando, setMenuEditando] =
    useState<number | null>(null);

  const [productoEditando, setProductoEditando] =
    useState<number | null>(null);

  const [cargando, setCargando] = useState(true);
  const [cargandoProductos, setCargandoProductos] =
    useState(true);

  const [guardando, setGuardando] = useState(false);
  const [guardandoProducto, setGuardandoProducto] =
    useState(false);

  const [error, setError] = useState("");
  const [errorProducto, setErrorProducto] =
    useState("");

  const API_MENU = `${API_BASE_URL}/api/Menu`;
  const API_PRODUCTO =
    `${API_BASE_URL}/api/Producto`;

  useEffect(() => {
    cargarMenus();
    cargarProductos();
  }, []);

  

  const guardarDatos = async (
    url: string,
    method: "POST" | "PUT",
    datos: object,
    mensajeError: string
  ) => {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error(mensajeError);
    }

    return response;
  };


  const cargarMenus = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch(API_MENU);

      if (!response.ok) {
        throw new Error(
          "No se pudieron cargar los menús"
        );
      }

      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los menús.");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioMenu = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarSubmitMenu = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.descripcion.trim() ||
      !formulario.precio ||
      !formulario.disponibilidad
    ) {
      setError("Completá todos los campos del menú.");
      return;
    }

    const precio = Number(formulario.precio);
    const disponibilidad = Number(
      formulario.disponibilidad
    );

    if (precio < 0 || disponibilidad < 0) {
      setError(
        "El precio y la disponibilidad no pueden ser negativos."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const datos = {
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        precio,
        disponibilidad,
      };

      const url =
        menuEditando === null
          ? API_MENU
          : `${API_MENU}/${menuEditando}`;

      const method =
        menuEditando === null ? "POST" : "PUT";

      await guardarDatos(
        url,
        method,
        datos,
        "No se pudo guardar el menú"
      );

      await cargarMenus();

      setFormulario(formularioInicial);
      setMenuEditando(null);
    } catch (error) {
      console.error(error);
      setError("No se pudo guardar el menú.");
    } finally {
      setGuardando(false);
    }
  };

  const editarMenu = (menu: Menu) => {
    setFormulario({
      nombre: menu.nombre,
      descripcion: menu.descripcion,
      precio: menu.precio.toString(),
      disponibilidad:
        menu.disponibilidad.toString(),
    });

    setMenuEditando(menu.id);
    setError("");
  };

  const cancelarEdicionMenu = () => {
    setFormulario(formularioInicial);
    setMenuEditando(null);
    setError("");
  };

  const eliminarMenu = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este menú?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_MENU}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo eliminar el menú"
        );
      }

      await cargarMenus();

      if (menuEditando === id) {
        cancelarEdicionMenu();
      }
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar el menú.");
    }
  };


  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      setErrorProducto("");

      const response = await fetch(API_PRODUCTO);

      if (!response.ok) {
        throw new Error(
          "No se pudieron cargar los productos"
        );
      }

      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error(error);
      setErrorProducto(
        "No se pudieron cargar los productos."
      );
    } finally {
      setCargandoProductos(false);
    }
  };

  const manejarCambioProducto = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setProductoForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarDisponible = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductoForm((prev) => ({
      ...prev,
      disponible: e.target.checked,
    }));
  };

  const manejarSubmitProducto = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !productoForm.nombre.trim() ||
      !productoForm.descripcion.trim() ||
      !productoForm.precio ||
      !productoForm.categoria.trim()
    ) {
      setErrorProducto(
        "Completá todos los campos del producto."
      );
      return;
    }

    const precio = Number(productoForm.precio);

    if (precio < 0) {
      setErrorProducto(
        "El precio no puede ser negativo."
      );
      return;
    }

    try {
      setGuardandoProducto(true);
      setErrorProducto("");

      const datos = {
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
        precio,
        categoria: productoForm.categoria,
        disponible: productoForm.disponible,
      };

      const url =
        productoEditando === null
          ? API_PRODUCTO
          : `${API_PRODUCTO}/${productoEditando}`;

      const method =
        productoEditando === null ? "POST" : "PUT";

      await guardarDatos(
        url,
        method,
        datos,
        "No se pudo guardar el producto"
      );

      await cargarProductos();

      setProductoForm(productoInicial);
      setProductoEditando(null);
    } catch (error) {
      console.error(error);
      setErrorProducto(
        "No se pudo guardar el producto."
      );
    } finally {
      setGuardandoProducto(false);
    }
  };

  const editarProducto = (producto: Producto) => {
    setProductoForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      categoria: producto.categoria,
      disponible: producto.disponible,
    });

    setProductoEditando(producto.id);
    setErrorProducto("");
  };

  const cancelarEdicionProducto = () => {
    setProductoForm(productoInicial);
    setProductoEditando(null);
    setErrorProducto("");
  };

  const eliminarProducto = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setErrorProducto("");

      const response = await fetch(
        `${API_PRODUCTO}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo eliminar el producto"
        );
      }

      await cargarProductos();

      if (productoEditando === id) {
        cancelarEdicionProducto();
      }
    } catch (error) {
      console.error(error);
      setErrorProducto(
        "No se pudo eliminar el producto."
      );
    }
  };

  return (
    <section className="menu-admin">
      <header className="menu-header">
        <span className="menu-tag">
          Panel Administrativo
        </span>

        <h1>Gestionar Menú</h1>

        <p>
          Creá, modificá y administrá los menús y
          productos disponibles para los alumnos.
        </p>
      </header>

      {/* =========================
          MENÚS
      ========================= */}

      {error && (
        <div className="menu-error">
          {error}
        </div>
      )}

      <div className="menu-grid">
        <section className="menu-card">
          <div className="menu-card-title">
            <PlusCircle size={28} />

            <h2>
              {menuEditando === null
                ? "Cargar menú del día"
                : "Editar menú"}
            </h2>
          </div>

          <form
            className="menu-form"
            onSubmit={manejarSubmitMenu}
          >
            <div className="menu-input">
              <label>Nombre</label>

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambioMenu}
                placeholder="Ej: Milanesa con puré"
              />
            </div>

            <div className="menu-input">
              <label>Descripción</label>

              <textarea
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambioMenu}
                rows={4}
                placeholder="Descripción del menú..."
              />
            </div>

            <div className="menu-row">
              <div className="menu-input">
                <label>Precio</label>

                <input
                  type="number"
                  name="precio"
                  value={formulario.precio}
                  onChange={manejarCambioMenu}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="menu-input">
                <label>Disponibilidad</label>

                <input
                  type="number"
                  name="disponibilidad"
                  value={
                    formulario.disponibilidad
                  }
                  onChange={manejarCambioMenu}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="menu-button"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : menuEditando === null
                ? "Guardar Menú"
                : "Guardar cambios"}
            </button>

            {menuEditando !== null && (
              <button
                type="button"
                className="menu-button"
                onClick={cancelarEdicionMenu}
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>

        <section className="menu-card">
          <div className="menu-card-title">
            <UtensilsCrossed size={28} />

            <h2>Menús anteriores</h2>
          </div>

          <div className="menu-history">
            {cargando ? (
              <p>Cargando menús...</p>
            ) : menus.length === 0 ? (
              <p>No hay menús cargados.</p>
            ) : (
              menus.map((menu) => (
                <article
                  className="history-item"
                  key={menu.id}
                >
                  <div>
                    <h4>{menu.nombre}</h4>

                    <span>
                      {new Date(
                        menu.fecha
                      ).toLocaleDateString("es-AR")}
                    </span>

                    <p>
                      $
                      {menu.precio.toLocaleString(
                        "es-AR"
                      )}{" "}
                      · {menu.disponibilidad}{" "}
                      disponibles
                    </p>
                  </div>

                  <div className="history-actions">
                    <button
                      className={`estado ${
                        menu.disponible
                          ? "disponible"
                          : "agotado"
                      }`}
                    >
                      {menu.disponible
                        ? "Disponible"
                        : "Agotado"}
                    </button>

                    <button
                      type="button"
                      className="menu-action edit"
                      onClick={() =>
                        editarMenu(menu)
                      }
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      className="menu-action delete"
                      onClick={() =>
                        eliminarMenu(menu.id)
                      }
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* =========================
          PRODUCTOS
      ========================= */}

      <div className="menu-section-divider">
        <h1>Gestión de productos</h1>
      </div>

      {errorProducto && (
        <div className="menu-error">
          {errorProducto}
        </div>
      )}

      <div className="menu-grid">
        <section className="menu-card">
          <div className="menu-card-title">
            <Package size={28} />

            <h2>
              {productoEditando === null
                ? "Crear producto"
                : "Editar producto"}
            </h2>
          </div>

          <form
            className="menu-form"
            onSubmit={manejarSubmitProducto}
          >
            <div className="menu-input">
              <label>Nombre</label>

              <input
                type="text"
                name="nombre"
                value={productoForm.nombre}
                onChange={manejarCambioProducto}
                placeholder="Ej: Coca Cola"
              />
            </div>

            <div className="menu-input">
              <label>Descripción</label>

              <textarea
                name="descripcion"
                value={productoForm.descripcion}
                onChange={manejarCambioProducto}
                rows={4}
                placeholder="Descripción del producto..."
              />
            </div>

            <div className="menu-row">
              <div className="menu-input">
                <label>Precio</label>

                <input
                  type="number"
                  name="precio"
                  value={productoForm.precio}
                  onChange={manejarCambioProducto}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="menu-input">
                <label>Categoría</label>

                <input
                  type="text"
                  name="categoria"
                  value={productoForm.categoria}
                  onChange={manejarCambioProducto}
                  placeholder="Ej: Bebidas"
                />
              </div>
            </div>

            <div className="producto-disponible">
              <input
                type="checkbox"
                checked={productoForm.disponible}
                onChange={manejarDisponible}
                id="producto-disponible"
              />

              <label htmlFor="producto-disponible">
                Producto disponible
              </label>
            </div>

            <button
              type="submit"
              className="menu-button"
              disabled={guardandoProducto}
            >
              {guardandoProducto
                ? "Guardando..."
                : productoEditando === null
                ? "Guardar producto"
                : "Guardar cambios"}
            </button>

            {productoEditando !== null && (
              <button
                type="button"
                className="menu-button"
                onClick={
                  cancelarEdicionProducto
                }
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>

        <section className="menu-card">
          <div className="menu-card-title">
            <Package size={28} />

            <h2>Productos existentes</h2>
          </div>

          <div className="menu-history">
            {cargandoProductos ? (
              <p>Cargando productos...</p>
            ) : productos.length === 0 ? (
              <p>No hay productos cargados.</p>
            ) : (
              productos.map((producto) => (
                <article
                  className="history-item"
                  key={producto.id}
                >
                  <div>
                    <h4>{producto.nombre}</h4>

                    <span>
                      {producto.categoria}
                    </span>

                    <p>
                      $
                      {producto.precio.toLocaleString(
                        "es-AR"
                      )}
                    </p>
                  </div>

                  <div className="history-actions">
                    <button
                      className={`estado ${
                        producto.disponible
                          ? "disponible"
                          : "agotado"
                      }`}
                    >
                      {producto.disponible
                        ? "Disponible"
                        : "Agotado"}
                    </button>

                    <button
                      type="button"
                      className="menu-action edit"
                      onClick={() =>
                        editarProducto(producto)
                      }
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      className="menu-action delete"
                      onClick={() =>
                        eliminarProducto(
                          producto.id
                        )
                      }
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default GestionarMenu;


