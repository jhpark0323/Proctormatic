import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "normalize.css"; // css 초기화

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
