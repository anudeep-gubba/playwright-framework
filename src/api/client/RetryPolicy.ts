export interface RetryPolicyOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryOnStatusCodes?: number[];
}

export class RetryPolicy {
  constructor(private readonly options: RetryPolicyOptions = {}) {}

  public async execute<T>(
    operation: () => Promise<T>,
    shouldRetry?: (error: unknown) => boolean,
  ): Promise<T> {
    const retries = this.options.maxRetries ?? 0;
    const delay = this.options.retryDelay ?? 1000;

    let currentAttempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        currentAttempt++;

        const canRetry =
          currentAttempt <= retries &&
          (shouldRetry ? shouldRetry(error) : true);
        if (!canRetry) {
          throw error;
        }

        await this.sleep(delay);
      }
    }
  }
  private async sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
