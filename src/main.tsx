import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Lovable preview / Vite HMR can sometimes try to connect to a local WS endpoint (e.g. 127.0.0.1)
// and throw an unhandled promise rejection: "WebSocket closed without opened.".
// This error is non-fatal and should not blank the screen.
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason as unknown;
  const message =
    typeof reason === "string"
      ? reason
      : (reason as { message?: string } | null | undefined)?.message;

  if (typeof message === "string" && message.includes("WebSocket closed without opened")) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
