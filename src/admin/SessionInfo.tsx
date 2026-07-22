import { getRolesFromSessionUser, isSystemAdministratorUser, type SessionUserLike } from "./sessionAccess.js";

interface SessionSnapshot {
  name: string;
  email: string;
  subject: string;
  expiresAt: string;
  scopes: string[];
  roles: string[];
}

interface UserManagerLike {
  getUser(): Promise<SessionUserLike | null>;
}

type ReactNodeLike = any;

type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactSessionApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
  useRef<T>(initialValue: T): { current: T };
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
  Fragment: any;
}

export interface SessionInfoProps {
  userManager: UserManagerLike;
  apiLabel: string;
  authority: string;
  formatDateTime: (value: Date) => string;
}

export function createSessionInfo(react: ReactSessionApi) {
  return function SessionInfo({ userManager, apiLabel, authority, formatDateTime }: SessionInfoProps) {
    const [canView, setCanView] = react.useState(false);
    const [isOpen, setIsOpen] = react.useState(false);
    const [sessionData, setSessionData] = react.useState<SessionSnapshot | null>(null);
    const containerRef = react.useRef<HTMLElement | null>(null);

    react.useEffect(() => {
      let cancelled = false;

      void (async () => {
        const user = await userManager.getUser();
        if (!cancelled) {
          setCanView(isSystemAdministratorUser(user));
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [userManager]);

    react.useEffect(() => {
      if (!isOpen) {
        return;
      }

      let cancelled = false;

      void (async () => {
        const user = await userManager.getUser();
        if (cancelled) {
          return;
        }

        setCanView(isSystemAdministratorUser(user));
        if (!user) {
          setSessionData(null);
          return;
        }

        const profile = (user.profile ?? {}) as Record<string, unknown>;
        setSessionData({
          name: readClaim(profile, ["name", "preferred_username"], "Unknown"),
          email: readClaim(profile, ["email"], "Not provided"),
          subject: readClaim(profile, ["sub"], "Unknown"),
          expiresAt: typeof (user as { expires_at?: number }).expires_at === "number"
            ? formatDateTime(new Date((user as { expires_at: number }).expires_at * 1000))
            : "Unknown",
          scopes: typeof (user as { scope?: string | null }).scope === "string"
            ? (user as { scope: string }).scope.split(" ").filter(Boolean)
            : [],
          roles: getRolesFromSessionUser(user),
        });
      })();

      return () => {
        cancelled = true;
      };
    }, [formatDateTime, isOpen, userManager]);

    react.useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handlePointerDown = (event: MouseEvent) => {
        const nextTarget = event.target;
        if (!(nextTarget instanceof Node)) {
          return;
        }

        if (containerRef.current?.contains(nextTarget)) {
          return;
        }

        setIsOpen(false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handlePointerDown);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    if (!canView) {
      return null;
    }

    const sessionStateLabel = sessionData ? `Expires ${sessionData.expiresAt}` : "View session details";
    const roleSummary = sessionData?.roles[0] ?? "System Admin";

    return react.createElement(
      "div",
      { className: "session-info-container", ref: containerRef },
      react.createElement(
        "button",
        {
          className: "session-info-button",
          onClick: () => setIsOpen((previousState) => !previousState),
          title: "Show session details",
          type: "button",
          "aria-expanded": isOpen,
          "aria-haspopup": "dialog",
        },
        react.createElement(
          "span",
          { className: "session-trigger-avatar", "aria-hidden": true },
          sessionData?.name?.charAt(0).toUpperCase() ?? "S"
        ),
        react.createElement(
          "span",
          { className: "session-trigger-copy" },
          react.createElement("span", { className: "session-trigger-title" }, roleSummary),
          react.createElement("span", { className: "session-trigger-subtitle" }, sessionStateLabel)
        ),
        react.createElement("span", { className: "session-trigger-chevron", "aria-hidden": true }, isOpen ? "▴" : "▾")
      ),
      isOpen
        ? react.createElement(
            "div",
            { className: "session-panel", role: "dialog", "aria-label": "Session information" },
            react.createElement(
              "div",
              { className: "session-panel-header" },
              react.createElement(
                "div",
                { className: "session-panel-identity" },
                react.createElement(
                  "div",
                  { className: "session-panel-avatar", "aria-hidden": true },
                  sessionData?.name?.charAt(0).toUpperCase() ?? "S"
                ),
                react.createElement(
                  "div",
                  { className: "session-panel-title-block" },
                  react.createElement("div", { className: "session-panel-title" }, sessionData?.name ?? "Session Information"),
                  react.createElement("div", { className: "session-panel-subtitle" }, sessionData?.email ?? "No active session found")
                )
              ),
              react.createElement(
                "button",
                { className: "close-btn", onClick: () => setIsOpen(false), type: "button", "aria-label": "Close session panel" },
                "×"
              )
            ),
            react.createElement(
              "div",
              { className: "session-panel-content" },
              sessionData
                ? buildSessionFields(react, sessionData, apiLabel, authority)
                : react.createElement("p", { className: "no-session" }, "No active session found.")
            )
        )
        : null
    );
  };
}

function readClaim(profile: Record<string, unknown>, claimNames: string[], fallback: string) {
  for (const claimName of claimNames) {
    const value = profile[claimName];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function buildSessionFields(
  react: ReactSessionApi,
  sessionData: SessionSnapshot,
  apiLabel: string,
  authority: string)
{
  return react.createElement(
    react.Fragment,
    null,
    react.createElement(
      "div",
      { className: "session-state-row" },
      createBadge(react, "System Admin"),
      createBadge(react, sessionData.expiresAt)
    ),
    createField(react, "Subject", sessionData.subject),
    createField(react, "API", apiLabel),
    createField(react, "Authority", authority),
    createBadgeField(react, "Scopes:", sessionData.scopes, "No scopes found."),
    createBadgeField(react, "Roles:", sessionData.roles, "No roles found.")
  );
}

function createField(react: ReactSessionApi, label: string, value: string) {
  return react.createElement(
    "div",
    { className: "session-field" },
    react.createElement("strong", null, label),
    react.createElement("span", { className: "session-field-value" }, value)
  );
}

function createBadge(react: ReactSessionApi, value: string) {
  return react.createElement("span", { className: "scope-badge" }, value);
}

function createBadgeField(react: ReactSessionApi, label: string, values: string[], emptyLabel: string) {
  const badges = values.length > 0
    ? values.map((value) => react.createElement("span", { key: value, className: "scope-badge" }, value))
    : [react.createElement("span", { className: "no-session", key: emptyLabel }, emptyLabel)];

  return react.createElement(
    "div",
    { className: "session-field session-scopes" },
    react.createElement("strong", null, label),
    react.createElement(
      "div",
      { className: "scopes-list" },
      ...badges
    )
  );
}
