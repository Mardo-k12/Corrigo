import { logger } from "./logger";

// DataDog Configuration
export interface DataDogConfig {
  apiKey: string;
  appKey: string;
  enabled: boolean;
  sampleRate?: number;
}

let ddConfig: DataDogConfig | null = null;

export function initDataDog(config: Partial<DataDogConfig> = {}) {
  const enabled = !!process.env.DATADOG_ENABLED && process.env.DATADOG_ENABLED === "true";
  const apiKey = process.env.DATADOG_API_KEY;
  const appKey = process.env.DATADOG_APP_KEY;

  if (!enabled || !apiKey || !appKey) {
    logger.warn(
      { enabled, hasApiKey: !!apiKey, hasAppKey: !!appKey },
      "DataDog disabled or not configured"
    );
    return;
  }

  ddConfig = {
    apiKey,
    appKey,
    enabled: true,
    sampleRate: config.sampleRate || 1.0,
  };

  logger.info("DataDog initialized");
}

export function trackMetric(
  metricName: string,
  value: number,
  tags?: Record<string, string>
) {
  if (!ddConfig?.enabled) return;

  const tagArray = tags
    ? Object.entries(tags).map(([k, v]) => `${k}:${v}`)
    : [];

  logger.debug(
    { metricName, value, tags: tagArray },
    "DataDog metric tracked"
  );

  // In production, would send to DataDog API:
  // fetch("https://api.datadoghq.com/api/v1/series", {
  //   method: "POST",
  //   headers: {
  //     "DD-API-KEY": ddConfig.apiKey,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     series: [{
  //       metric: metricName,
  //       points: [[Date.now() / 1000, value]],
  //       tags: tagArray,
  //     }],
  //   }),
  // });
}

export function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>,
  tags?: Record<string, string>
) {
  if (!ddConfig?.enabled) return;

  logger.info(
    { eventName, eventData, tags },
    "DataDog event tracked"
  );

  // In production, would send to DataDog Event API
}

export function trackRequestMetrics(
  method: string,
  path: string,
  statusCode: number,
  duration: number
) {
  if (!ddConfig?.enabled) return;

  trackMetric("api.request.duration", duration, {
    method,
    path,
    status: statusCode.toString(),
  });

  trackMetric("api.request.count", 1, {
    method,
    status: statusCode.toString(),
  });
}

export function trackErrorMetric(
  errorType: string,
  errorMessage: string,
  context?: Record<string, unknown>
) {
  if (!ddConfig?.enabled) return;

  trackMetric("api.error.count", 1, {
    error_type: errorType,
  });

  logger.error(
    { errorType, errorMessage, context },
    "DataDog error tracked"
  );
}
