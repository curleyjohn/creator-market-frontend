import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "@fontsource/inter";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <div className="tracking-wider">
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
