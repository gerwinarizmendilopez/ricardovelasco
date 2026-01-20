import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Desactivar el error overlay de desarrollo
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    // Prevenir que se muestre el overlay rojo de errores
    e.stopImmediatePropagation();
  });
  window.addEventListener('unhandledrejection', (e) => {
    // Prevenir que se muestre el overlay para promesas rechazadas
    e.stopImmediatePropagation();
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
