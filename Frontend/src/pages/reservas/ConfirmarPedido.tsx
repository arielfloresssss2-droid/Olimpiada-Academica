
import { useState, useEffect } from "react";
import "../../styles/reservas/ConfirmarPedidos.css";
import { API_BASE_URL } from "../../config/api";

interface ConfirmarPedidoProps {
    setActiveSection?: (section: string) => void;
}

interface ItemCarrito {
    id: number;
    nombre: string;
    precio: number;
    tipo: "producto" | "menu";
}

function ConfirmarPedido({ setActiveSection }: ConfirmarPedidoProps) {
    const [metodoPago, setMetodoPago] = useState<string>("");
    const [cargando, setCargando] = useState<boolean>(false);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    useEffect(() => {
        const guardado = localStorage.getItem("carrito");

        if (guardado) {
            try {
                const datos = JSON.parse(guardado);

                const carritoCorregido = datos.map((item: any) => ({
                    ...item,
                    tipo: item.tipo || "producto",
                }));

                setCarrito(carritoCorregido);
            } catch (err) {
                console.error("Error al parsear el carrito:", err);
            }
        }
    }, []);

    const total = carrito.reduce(
        (acc, item) => acc + Number(item.precio),
        0
    );

    const manejarContinuar = async () => {
        if (!metodoPago) {
            alert("Por favor, seleccioná un método de pago.");
            return;
        }

        if (carrito.length === 0) {
            alert("El carrito está vacío.");

            if (setActiveSection) {
                setActiveSection("reservar");
            }

            return;
        }

        const usuarioRaw = localStorage.getItem("usuario");

        if (!usuarioRaw) {
            alert("Sesión no válida. Por favor, volvé a iniciar sesión.");
            return;
        }

        let idUsuario: number | null = null;

        try {
            const usuario = JSON.parse(usuarioRaw);
            idUsuario = usuario.id || usuario.Id;
        } catch {
            alert("Error al leer los datos de usuario.");
            return;
        }

        if (!idUsuario) {
            alert("No se encontró el ID de usuario.");
            return;
        }

        setCargando(true);

        try {
            const productosAgrupados = carrito.reduce(
                (
                    acc: {
                        productoId?: number;
                        menuId?: number;
                        cantidad: number;
                    }[],
                    item
                ) => {
                    const existente = acc.find(
                        (p) =>
                            item.tipo === "menu"
                                ? p.menuId === item.id
                                : p.productoId === item.id
                    );

                    if (existente) {
                        existente.cantidad++;
                    } else {
                        if (item.tipo === "menu") {
                            acc.push({
                                menuId: item.id,
                                cantidad: 1,
                            });
                        } else {
                            acc.push({
                                productoId: item.id,
                                cantidad: 1,
                            });
                        }
                    }

                    return acc;
                },
                []
            );

            const metodoPagoEnum =
                metodoPago === "efectivo" ? 0 : 4;

            const pedido = {
                idUsuario: Number(idUsuario),
                metodoPago: metodoPagoEnum,
                productos: productosAgrupados.map((item) => ({
                    productoId: item.productoId ?? null,
                    menuId: item.menuId ?? null,
                    cantidad: item.cantidad,
                })),
            };

            console.log("Pedido enviado a la API:", pedido);

            const response = await fetch(
                `${API_BASE_URL}/api/pedido`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(pedido),
                }
            );

            if (!response.ok) {
                const errorTexto = await response.text();
                throw new Error(
                    errorTexto || "Error al crear el pedido"
                );
            }

            const data = await response.json();

            console.log(
                "Pedido guardado en la base de datos:",
                data
            );

            localStorage.removeItem("carrito");
            setCarrito([]);

            if (metodoPago === "efectivo") {
                alert(
                    "¡Pedido realizado correctamente! Podés abonar tu pedido en el comedor."
                );
            } else {
                alert(
                    "¡Pedido registrado con Mercado Pago! Podés ver el estado en Mis Reservas."
                );
            }

            if (setActiveSection) {
                setActiveSection("reservas");
            }
        } catch (error: unknown) {
            console.error(error);

            const mensaje =
                error instanceof Error
                    ? error.message
                    : "Error al realizar el pedido";

            alert(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <section className="cp-section">
            <div className="cp-header">
                <h2>Confirmar pedido</h2>

                <p>
                    Seleccioná el método de pago para continuar
                </p>
            </div>

            <div className="cp-card">
                <h3>Método de pago</h3>

                {carrito.length > 0 && (
                    <div className="cp-resumen">
                        <p>
                            Total de productos:{" "}
                            <strong>{carrito.length}</strong>
                        </p>

                        <p className="cp-total">
                            Total:{" "}
                            <strong>
                                $
                                {total.toLocaleString("es-AR")}
                            </strong>
                        </p>
                    </div>
                )}

                <div className="cp-metodos">
                    <button
                        type="button"
                        className={`cp-metodo ${
                            metodoPago === "efectivo"
                                ? "seleccionado"
                                : ""
                        }`}
                        onClick={() =>
                            setMetodoPago("efectivo")
                        }
                        disabled={cargando}
                    >
                        <span className="cp-metodo-icono">
                            💵
                        </span>

                        <h4>Efectivo</h4>

                        <p>
                            Pagá tu pedido en el comedor
                        </p>
                    </button>

                    <button
                        type="button"
                        className={`cp-metodo ${
                            metodoPago === "mercado-pago"
                                ? "seleccionado"
                                : ""
                        }`}
                        onClick={() =>
                            setMetodoPago("mercado-pago")
                        }
                        disabled={cargando}
                    >
                        <span className="cp-metodo-icono">
                            💳
                        </span>

                        <h4>Mercado Pago</h4>

                        <p>
                            Pagá de forma online
                        </p>
                    </button>
                </div>

                <button
                    type="button"
                    className="cp-continuar"
                    disabled={
                        !metodoPago ||
                        cargando ||
                        carrito.length === 0
                    }
                    onClick={manejarContinuar}
                >
                    {cargando
                        ? "Guardando pedido..."
                        : "Continuar"}
                </button>

                {setActiveSection && (
                    <button
                        type="button"
                        className="cp-volver"
                        onClick={() =>
                            setActiveSection("reservar")
                        }
                        disabled={cargando}
                    >
                        ← Volver a modificar mi pedido
                    </button>
                )}
            </div>
        </section>
    );
}

export default ConfirmarPedido;
