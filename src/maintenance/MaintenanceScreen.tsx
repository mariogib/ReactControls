import { useEffect, useState } from "react";

export interface MaintenanceScreenProps {
  apiEndpoint: string;
  lastCheck: Date;
  checkAttempts: number;
  error?: string;
}

export function MaintenanceScreen({
  apiEndpoint,
  lastCheck,
  checkAttempts,
}: MaintenanceScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((previous) => (previous.length >= 3 ? "" : `${previous}.`));
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  const formattedLastCheck = lastCheck.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        <div className="maintenance-content">
          <div className="maintenance-icon">🔧</div>

          <h1 className="maintenance-title">Services Under Maintenance</h1>

          <p className="maintenance-description">
            We&apos;re currently experiencing connectivity issues with our backend services.
            <br />
            Don&apos;t worry, we&apos;re automatically checking for restoration.
          </p>

          <div className="connection-status">
            <div className="status-header">
              <span className="status-indicator"></span>
              <span className="status-label">Connection Status</span>
              <span className="status-value">Checking{dots}</span>
            </div>

            <div className="status-details">
              <div className="status-row">
                <span className="status-key">API Endpoint:</span>
                <span className="status-endpoint">{apiEndpoint}</span>
              </div>
              <div className="status-row">
                <span className="status-key">Last Check:</span>
                <span className="status-time">{formattedLastCheck}</span>
              </div>
              <div className="status-row">
                <span className="status-key">Check Attempts:</span>
                <span className="status-count">{checkAttempts}</span>
              </div>
            </div>
          </div>

          <div className="info-boxes">
            <div className="info-box info-box-primary">
              <div className="info-box-icon">🔄</div>
              <div className="info-box-content">
                <h3 className="info-box-title">Auto-Recovery</h3>
                <p className="info-box-text">
                  We&apos;re checking every 5 seconds. You&apos;ll be redirected automatically when services are back.
                </p>
              </div>
            </div>

            <div className="info-box info-box-secondary">
              <div className="info-box-icon">💡</div>
              <div className="info-box-content">
                <h3 className="info-box-title">What to Do?</h3>
                <p className="info-box-text">
                  Just wait here. No need to refresh. We&apos;ll take you back when ready.
                </p>
              </div>
            </div>
          </div>

          <div className="possible-causes">
            <h3 className="causes-title">Possible Causes:</h3>
            <ul className="causes-list">
              <li>Backend API services are being updated or restarted</li>
              <li>Network connectivity issues between client and server</li>
              <li>Server is temporarily unavailable for maintenance</li>
            </ul>
          </div>

          <p className="maintenance-footer">
            If this persists for more than a few minutes, please contact your system administrator.
          </p>

          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceScreen;
