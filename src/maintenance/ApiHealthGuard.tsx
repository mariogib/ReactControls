import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ApiHealthMonitor, type HealthCheckResult } from "./health.js";
import { MaintenanceScreen } from "./MaintenanceScreen.js";

export interface ApiHealthGuardProps {
  children: ReactNode;
  healthEndpoint: string;
  checkIntervalMs?: number;
  timeoutMs?: number;
  requestHeaders?: Record<string, string>;
}

export function ApiHealthGuard({
  children,
  healthEndpoint,
  checkIntervalMs,
  timeoutMs,
  requestHeaders,
}: ApiHealthGuardProps) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [checkAttempts, setCheckAttempts] = useState(0);

  const monitor = useMemo(
    () =>
      new ApiHealthMonitor({
        endpoint: healthEndpoint,
        checkIntervalMs,
        timeoutMs,
        requestHeaders,
        onStatusChange: (result) => {
          setHealthResult(result);
          setCheckAttempts((previous) => previous + 1);

          if (result.isHealthy) {
            setIsHealthy((previous) => {
              if (!previous) {
                setCheckAttempts(0);
              }

              return true;
            });
          } else {
            setIsHealthy(false);
          }
        },
      }),
    [healthEndpoint, checkIntervalMs, timeoutMs, requestHeaders],
  );

  useEffect(() => {
    monitor.start();
    return () => {
      monitor.stop();
    };
  }, [monitor]);

  if (!isHealthy && healthResult) {
    return (
      <MaintenanceScreen
        apiEndpoint={healthResult.endpoint}
        lastCheck={healthResult.lastCheck}
        checkAttempts={checkAttempts}
        error={healthResult.error}
      />
    );
  }

  return <>{children}</>;
}

export default ApiHealthGuard;
