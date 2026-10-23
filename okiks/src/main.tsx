import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { useApp } from "./store";
import { createRepository } from "./storage/repository";
import "./styles.css";

registerSW({
  immediate: true,
  // Cherche une nouvelle version à chaque retour sur l'application et toutes les heures.
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    const check = () => void reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && check());
    setInterval(check, 60 * 60 * 1000);
    check();
  },
});

createRepository().then((repo) => useApp.getState().init(repo));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
