interface WindowEventMap {
  "pwa-update-ready": CustomEvent<{
    applyUpdate: () => void;
  }>;
}
