import { Secrets } from "../../../config/secretsLoader";

const PLACEHOLDER_PATTERN = /^\{\{\s*([\w.]+)\s*\}\}$/;

/**
 * Deep-walks a parsed test-data object and replaces any string value that is
 * *entirely* a `{{key}}` placeholder (e.g. "{{uiValidUserPassword}}") with the
 * matching value from `Secrets`. Applied once in BaseDataProvider.load(), so
 * it runs identically for JSON/YAML/CSV/Excel regardless of provider.
 */
export function resolveSecrets<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => resolveSecrets(item)) as unknown as T;
  }

  if (typeof value === "string") {
    const match = PLACEHOLDER_PATTERN.exec(value);
    return (match ? Secrets.get(match[1]) : value) as unknown as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, val]) => [key, resolveSecrets(val)],
    );

    return Object.fromEntries(entries) as T;
  }

  return value;
}
