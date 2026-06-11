import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { App } from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    {/* HashRouter avoids 404s on GitHub Pages deep links. */}
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);
