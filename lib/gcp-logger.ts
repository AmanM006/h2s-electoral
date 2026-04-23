/**
 * Google Cloud Logging integration for Civic Copilot.
 *
 * Provides a `logEvent` helper that writes structured log entries to
 * a dedicated "civic-copilot-log" channel. Automatically no-ops in
 * local development when GCP credentials are not available.
 *
 * @module lib/gcp-logger
 */

import { Logging } from '@google-cloud/logging';

/**
 * Detect whether we are running on GCP (Cloud Run sets K_SERVICE,
 * or the user may have GOOGLE_CLOUD_PROJECT / GCLOUD_PROJECT set).
 */
const isGCP = !!(
  process.env.K_SERVICE ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT
);

/**
 * Lazily instantiated Logging client — only created when on GCP.
 */
const logging = isGCP ? new Logging() : null;
const log = logging?.log('civic-copilot-log') ?? null;

/**
 * Writes a structured log entry to Google Cloud Logging.
 * Silently no-ops when running outside of a GCP environment.
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
  if (!log) return; // Not on GCP — silently skip

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
  } catch {
    // Silently ignore — even on GCP, transient logging failures should not crash the app
  }
}

