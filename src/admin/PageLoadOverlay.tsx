import * as React from "react";

export interface PageLoadOverlayProps {
  routeKey: string;
  message?: string;
  settleMs?: number;
}

export function PageLoadOverlay({
  routeKey,
  message = "Loading page...",
  settleMs = 450,
}: PageLoadOverlayProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, settleMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [routeKey, settleMs]);

  if (!visible) {
    return null;
  }

  return (
    <div className="admin-content-overlay" role="status" aria-live="polite" aria-label={message}>
      <div className="admin-content-overlay-card">
        <div className="admin-content-overlay-spinner" aria-hidden="true" />
        <p className="admin-content-overlay-message">{message}</p>
      </div>
    </div>
  );
}
