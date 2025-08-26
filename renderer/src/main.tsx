import { createRoot } from "react-dom/client";
import { App } from "./App.js";

// Initialize the React app
const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
