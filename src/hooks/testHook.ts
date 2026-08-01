import { test as base } from "@playwright/test";
import { registerBeforeEachHook } from "./beforeEachHook";
import { registerAfterEachHook } from "./afterEachHook";

export function registerTestHooks(test: typeof base): void {
  registerBeforeEachHook(test);
  registerAfterEachHook(test);
}
