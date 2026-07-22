const OVERLAY_ID = "theme-loading-overlay";
const STYLE_ID = "theme-loading-overlay-style";

const DEFAULT_OVERLAY_CSS = `
#theme-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0e1a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.theme-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: theme-spinner-rotate 1s linear infinite;
}

@keyframes theme-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
`;

export interface ThemeLoadingOverlayOptions {
  overlayId?: string;
  styleId?: string;
  cssText?: string;
}

export function ensureThemeLoadingOverlay({
  overlayId = OVERLAY_ID,
  styleId = STYLE_ID,
  cssText = DEFAULT_OVERLAY_CSS,
}: ThemeLoadingOverlayOptions = {}) {
  if (typeof document === "undefined") {
    return;
  }

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  if (document.getElementById(overlayId)) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = overlayId;

  const spinner = document.createElement("div");
  spinner.className = "theme-spinner";
  overlay.appendChild(spinner);

  if (document.body.firstChild) {
    document.body.insertBefore(overlay, document.body.firstChild);
    return;
  }

  document.body.appendChild(overlay);
}
