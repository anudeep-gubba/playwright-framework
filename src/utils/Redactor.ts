const SENSITIVE_KEY_PATTERN =
  /^(password|token|accessToken|refreshToken|authorization|secret|apiKey|clientSecret)$/i;

/**
 * Deep-clones a value, replacing any object key that matches a known-sensitive
 * name (password, token, authorization, ...) with a fixed mask. Used before
 * writing request/response data to logs or report attachments, so credentials
 * and bearer tokens never end up in plaintext in logs/*.log, the Playwright
 * HTML report, or Allure results.
 */
export function redact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item)) as unknown as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, val]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "*****" : redact(val),
      ],
    );

    return Object.fromEntries(entries) as T;
  }

  return value;
}
