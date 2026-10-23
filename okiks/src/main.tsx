import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { useApp } from "./store";
import { createRepository } from "./storage/repository";
import "./styles.css";

registerSW({ immediate: true });

createRepository().then((repo) => useApp.getState().init(repo));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
