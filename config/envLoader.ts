import dotenv from "dotenv";
import path from "path";

export type TestDataFormat = "json" | "yaml";

const environment = process.env.TEST_ENV ?? "qa";

dotenv.config({
  path: path.resolve(process.cwd(), `config/environments/${environment}.env`),
});

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable '${key}' is missing.`);
  }

  return value;
}

export const ENV = Object.freeze({
  ENVIRONMENT: environment,

  BASE_URL: required("BASE_URL"),

  API_BASE_URL: required("API_BASE_URL"),

  TEST_DATA_FORMAT: required("TEST_DATA_FORMAT") as TestDataFormat,

  HEADLESS: process.env.HEADLESS === "true",

  SLOW_MO: Number(process.env.SLOW_MO ?? 0),

  DEFAULT_TIMEOUT: Number(process.env.DEFAULT_TIMEOUT ?? 30000),

  EXPECT_TIMEOUT: Number(process.env.EXPECT_TIMEOUT ?? 10000),

  VIEWPORT: {
    width: Number(process.env.VIEWPORT_WIDTH ?? 1440),
    height: Number(process.env.VIEWPORT_HEIGHT ?? 900),
  },

  LOCALE: process.env.LOCALE ?? "en-US",

  TIMEZONE: process.env.TIMEZONE ?? "Asia/Kolkata",
});
