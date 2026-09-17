import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HistorialPage from "./pages/perfil/Historial";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import RegistroCodigoEnviado from "./pages/auth/RegistroCodigoEnviado";
import VerificarRegistro from "./pages/auth/VerificarRegistro";
import CuentaConfirmada from "./pages/auth/CuentaConfirmada";
import SoportePage from "./pages/soporte/Soporte";
import SoporteEnviadoPage from "./pages/soporte/SoporteEnviado";
import Dashboard from "./pages/home/Dashboard";
import CambiarContra from "./pages/auth/CambiarContra";
import DetallesPedido from "./pages/reservas/DetallesPedido";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CodigoEnviado from "./pages/auth/CodigoEnviado";
import VerificarCodigo from "./pages/auth/VerificarCodigo";
import NuevaContrasena from "./pages/auth/NuevaContrasena";
import ContrasenaActualizada from "./pages/auth/ContrasenaActualizada";
import DashboardAdmin from "./pages/admin/DashboardAdmin";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* AUTH */}

        <Route path="/" element={<LoginPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/register/sent"
          element={<RegistroCodigoEnviado />}
        />

        <Route
          path="/register/verify"
          element={<VerificarRegistro />}
        />

        <Route
          path="/register/success"
          element={<CuentaConfirmada />}
        />

        {/* PERFIL */}

        <Route path="/historial" element={<HistorialPage />} />

        {/* SUPPORT */}

        <Route path="/support" element={<SoportePage />} />

        <Route
          path="/support-success"
          element={<SoporteEnviadoPage />}
        />

        {/* DASHBOARD USUARIO */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* CAMBIAR CONTRASEÑA */}

        <Route
          path="/cambiar-contra"
          element={<CambiarContra />}
        />

        {/* DASHBOARD ADMINISTRADOR */}

        <Route
          path="/admin"
          element={<DashboardAdmin />}
        />

        {/* RESERVAS */}

        <Route
          path="/detalles-pedido/:id"
          element={<DetallesPedido />}
        />

        {/* RECUPERAR CONTRASEÑA */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/forgot-password/sent"
          element={<CodigoEnviado />}
        />

        <Route
          path="/forgot-password/verify"
          element={<VerificarCodigo />}
        />

        <Route
          path="/forgot-password/reset"
          element={<NuevaContrasena />}
        />

        <Route
          path="/forgot-password/success"
          element={<ContrasenaActualizada />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);