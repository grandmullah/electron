import { createRoot } from "react-dom/client";
import { App } from "./App.js";

// Import Windows printer service to ensure it's included in the build
import "./services/WindowsPrinterService";

// Initialize the React app
const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
