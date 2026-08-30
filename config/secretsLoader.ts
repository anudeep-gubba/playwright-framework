import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { ENV } from "./envLoader";

/**
 * Sensitive test-data values (credentials, tokens, ...) never live in
 * src/data/datasets/* directly — those files reference them as `{{key}}`
 * (see src/data/utils/resolveSecrets.ts). The actual values come from here:
 *
 *  - Locally: config/secrets/<env>.env (gitignored — copy the matching
 *    *.env.example template and fill in real values).
 *  - In CI: environment variables of the same name, injected from GitHub
 *    Actions repository secrets (see .github/workflows/playwright-tests.yml).
 *    Env vars always win over the local file, so CI never needs the file.
 */
const secretsFilePath = path.resolve(
  process.cwd(),
  "config/secrets",
  `${ENV.ENVIRONMENT}.env`,
);

const fileSecrets: Record<string, string> = fs.existsSync(secretsFilePath)
  ? (dotenv.parse(fs.readFileSync(secretsFilePath)) as Record<string, string>)
  : {};

export const Secrets = Object.freeze({
  /**
   * Resolves a secret by key. Checks real environment variables first (how
   * CI supplies secrets), then falls back to the local secrets file. Throws
   * if the key is referenced by test data but not defined anywhere, so a
   * missing secret fails fast with an actionable message instead of a test
   * silently logging in with the literal string "{{key}}".
   */
  get(key: string): string {
    const value = process.env[key] ?? fileSecrets[key];
    if (!value) {
      throw new Error(
        `Secret '${key}' (referenced as {{${key}}} in test data) was not found. ` +
          `Add it to config/secrets/${ENV.ENVIRONMENT}.env (copy ${ENV.ENVIRONMENT}.env.example) ` +
          `or set it as an environment variable of the same name.`,
      );
    }

    return value;
  },
});
