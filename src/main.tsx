import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/index.css";

let updatePending = false;
let activeRegistration: ServiceWorkerRegistration | undefined;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updatePending = true;
    window.dispatchEvent(
      new CustomEvent("pwa-update-ready", {
        detail: {
          applyUpdate: () => {
            updatePending = false;
            void updateSW(true);
          },
        },
      }),
    );
  },
  onRegisteredSW(_swUrl, registration) {
    activeRegistration = registration;

    window.dispatchEvent(
      new CustomEvent("pwa-refresh-ready", {
        detail: {
          refreshApp: async () => {
            if (activeRegistration) {
              await activeRegistration.update();
            }

            if (updatePending) {
              await updateSW(true);
              return;
            }

            window.location.reload();
          },
        },
      }),
    );

    if (!registration) {
      return;
    }

    window.setInterval(() => {
      if (document.visibilityState === "visible" && !updatePending) {
        void registration.update();
      }
    }, 60 * 1000);
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
