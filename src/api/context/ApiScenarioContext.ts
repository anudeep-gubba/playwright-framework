export class ApiScenarioContext {
  private readonly values = new Map<string, unknown>();

  /**
   * Stores a value in the scenario context for the current test.
   */
  public set(key: string, value: unknown): void {
    this.values.set(key, value);
  }

  /**
   * Retrieves a stored value from the scenario context.
   * Throws if the value is not found.
   */
  public get<T>(key: string): T {
    if (!this.values.has(key)) {
      throw new Error(`Scenario context value '${key}' was not found.`);
    }

    return this.values.get(key) as T;
  }

  /**
   * Checks if the value exists.
   */
  public has(key: string): boolean {
    return this.values.has(key);
  }

  /**
   * Removes one value.
   */
  public remove(key: string): void {
    this.values.delete(key);
  }

  /**
   * Clears the complete scenario context.
   */
  public clear(): void {
    this.values.clear();
  }
}
