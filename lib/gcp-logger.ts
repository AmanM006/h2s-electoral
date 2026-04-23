/**
 * Google Cloud Logging integration for Civic Copilot.
 *
 * Provides a `logEvent` helper that writes structured log entries to
 * a dedicated "civic-copilot-log" channel. Wrapped in a try-catch so
 * missing GCP credentials never crash the application.
 *
 * @module lib/gcp-logger
 */

import { Logging } from '@google-cloud/logging';

/**
 * Instantiate Google Cloud Logging client.
 * When running on GCP (Cloud Run / GKE) this picks up default credentials.
 */
const logging = new Logging();
const log = logging.log('civic-copilot-log');

/**
 * Writes a structured log entry to Google Cloud Logging.
 *
 * @param severity - Log severity (e.g. "INFO", "WARNING", "ERROR").
 * @param message  - Human-readable log message.
 * @param data     - Optional structured payload attached to the entry.
 */
export async function logEvent(
  severity: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    const metadata = {
      resource: { type: 'global' },
      severity,
    };

    const entry = log.entry(metadata, {
      message,
      ...data,
      timestamp: new Date().toISOString(),
    });

    await log.write(entry);
  } catch (error) {
    // Silently ignore — local dev and non-GCP environments won't have creds
    console.warn('[GCP Logger] Could not write log:', (error as Error).message);
  }
}
