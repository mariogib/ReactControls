export interface HealthCheckResult {
  isHealthy: boolean;
  endpoint: string;
  lastCheck: Date;
  error?: string;
}

export interface CheckApiHealthOptions {
  endpoint: string;
  timeoutMs?: number;
  requestHeaders?: Record<string, string>;
}

export async function checkApiHealth(options: CheckApiHealthOptions): Promise<HealthCheckResult> {
  const { endpoint, timeoutMs = 5000, requestHeaders } = options;

  const result: HealthCheckResult = {
    isHealthy: false,
    endpoint,
    lastCheck: new Date(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(requestHeaders ?? {}),
      },
    });

    window.clearTimeout(timeoutId);

    if (response.ok) {
      result.isHealthy = true;
    } else {
      result.error = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      result.error = "Request timeout - API not responding";
    } else if (error instanceof Error && error.message.includes("Failed to fetch")) {
      result.error = "Network connectivity issues between client and server";
    } else if (error instanceof Error) {
      result.error = error.message;
    } else {
      result.error = "Unknown error occurred";
    }
  }

  return result;
}

export interface ApiHealthMonitorOptions {
  endpoint: string;
  checkIntervalMs?: number;
  timeoutMs?: number;
  requestHeaders?: Record<string, string>;
  onStatusChange?: (result: HealthCheckResult) => void;
}

export class ApiHealthMonitor {
  private readonly endpoint: string;

  private readonly checkIntervalMs: number;

  private readonly timeoutMs: number;

  private readonly requestHeaders?: Record<string, string>;

  private readonly onStatusChange?: (result: HealthCheckResult) => void;

  private timerId: number | null = null;

  private checkCount = 0;

  public constructor(options: ApiHealthMonitorOptions) {
    this.endpoint = options.endpoint;
    this.checkIntervalMs = options.checkIntervalMs ?? 5000;
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.requestHeaders = options.requestHeaders;
    this.onStatusChange = options.onStatusChange;
  }

  public start(): void {
    if (this.timerId) {
      return;
    }

    void this.performCheck();
    this.timerId = window.setInterval(() => {
      void this.performCheck();
    }, this.checkIntervalMs);
  }

  public stop(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getCheckCount(): number {
    return this.checkCount;
  }

  public resetCheckCount(): void {
    this.checkCount = 0;
  }

  private async performCheck(): Promise<void> {
    this.checkCount++;
    const result = await checkApiHealth({
      endpoint: this.endpoint,
      timeoutMs: this.timeoutMs,
      requestHeaders: this.requestHeaders,
    });

    this.onStatusChange?.(result);
  }
}
