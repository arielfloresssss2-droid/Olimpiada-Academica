
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

            alert("¡Reporte de incidente enviado correctamente! Ya podés hacerle seguimiento en Mis Incidentes.");

            if (setActiveSection) {
                setActiveSection("reservas");
            }
        } catch (error: unknown) {
            console.error(error);

            const mensaje =
                error instanceof Error
                    ? error.message
                    : "Error al registrar el reporte";

            alert(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <section className="cp-section">
            <div className="cp-header">
                <h2>Confirmar reporte de incidente</h2>

                <p>
                    Seleccioná la vía de seguimiento para el reporte
                </p>
            </div>

            <div className="cp-card">
                <h3>Canal de Notificaciones y Seguimiento</h3>

                {carrito.length > 0 && (
                    <div className="cp-resumen">
                        <p>
                            Servicios / Incidentes seleccionados:{" "}
                            <strong>{carrito.length}</strong>
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
                            📱
                        </span>

                        <h4>Notificación en Plataforma</h4>

                        <p>
                            Seguimiento en tiempo real desde la web
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
                            📧
                        </span>

                        <h4>Correo Electrónico</h4>

                        <p>
                            Recibir informes de resolución por mail
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
                        ? "Enviando reporte..."
                        : "Confirmar y enviar incidente"}
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
                        ← Volver a modificar mi solicitud
                    </button>
                )}
            </div>
        </section>
    );
}

export default ConfirmarPedido;
