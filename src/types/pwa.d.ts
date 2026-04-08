interface WindowEventMap {
  "pwa-update-ready": CustomEvent<{
    applyUpdate: () => void;
  }>;
  "pwa-refresh-ready": CustomEvent<{
    refreshApp: () => void;
  }>;
}
