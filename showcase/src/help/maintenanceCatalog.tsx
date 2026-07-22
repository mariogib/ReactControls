import React from "react";
import { MaintenanceScreen, createStatusMessage } from "@lunarq/frontend-shared";
import { snippetCode, type HelpGroup } from "./types";

const StatusMessage = createStatusMessage(React);

function MaintenanceScreenExample() {
  return (
    <div className="showcase-help-maintenance-host">
      <MaintenanceScreen
        apiEndpoint="https://api.example.lunarq/health"
        lastCheck={new Date()}
        checkAttempts={3}
        error="Connection timed out"
      />
    </div>
  );
}

function ApiHealthGuardExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <StatusMessage
        tone="info"
        title="ApiHealthGuard"
        detail="Poll a health endpoint and swap the app for MaintenanceScreen when the API is unavailable."
      />
      <pre className="showcase-code-block">{`import { ApiHealthGuard } from "@lunarq/frontend-shared";

<ApiHealthGuard
  apiEndpoint="https://api.example.lunarq/health"
  pollIntervalMs={15000}
>
  <App />
</ApiHealthGuard>`}</pre>
    </div>
  );
}

export const MAINTENANCE_HELP_GROUPS: HelpGroup[] = [
  {
    id: "maintenance",
    eyebrow: "Maintenance",
    title: "Health & Downtime UI",
    items: [
      {
        id: "maintenanceScreen",
        title: "MaintenanceScreen",
        description: "Full-page maintenance status UI with last-check metadata.",
        code: snippetCode(
          'import { MaintenanceScreen } from "@lunarq/frontend-shared";',
          "",
          `export function Example() {
  return (
    <MaintenanceScreen
      apiEndpoint="https://api.example.lunarq/health"
      lastCheck={new Date()}
      checkAttempts={3}
    />
  );
}`,
        ),
        Example: MaintenanceScreenExample,
      },
      {
        id: "apiHealthGuard",
        title: "ApiHealthGuard",
        description: "Watch API health and render MaintenanceScreen when checks fail.",
        code: snippetCode(
          'import { ApiHealthGuard } from "@lunarq/frontend-shared";',
          "",
          `export function Root() {
  return (
    <ApiHealthGuard apiEndpoint="https://api.example.lunarq/health">
      <App />
    </ApiHealthGuard>
  );
}`,
        ),
        Example: ApiHealthGuardExample,
      },
    ],
  },
];
