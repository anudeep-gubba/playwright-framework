export interface TabularRow {
  key?: unknown;
  value?: unknown;
  type?: unknown;
}

/**
 * CSV/Excel rows are flat "key,value,type" triples (dot-path key, e.g. "login.validUser.email").
 * This rebuilds the nested object shape that JSON/YAML datasets already produce, so the same
 * data models (UiData, ApiData, ...) work unchanged regardless of source format.
 */
export function unflattenRows(rows: TabularRow[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const row of rows) {
    const path = String(row.key ?? "").trim();
    if (!path) {
      continue;
    }

    setPath(result, path.split("."), coerce(row.value, row.type));
  }

  return result;
}

function setPath(target: Record<string, unknown>, path: string[], value: unknown): void {
  const [head, ...rest] = path;

  if (rest.length === 0) {
    target[head] = value;
    return;
  }

  target[head] = (target[head] as Record<string, unknown>) ?? {};
  setPath(target[head] as Record<string, unknown>, rest, value);
}

function coerce(value: unknown, type: unknown): unknown {
  const normalizedType = String(type ?? "").trim().toLowerCase() || "string";

  switch (normalizedType) {
    case "number":
      return Number(value);
    case "boolean":
      return String(value).trim().toLowerCase() === "true";
    default:
      return String(value ?? "");
  }
}
