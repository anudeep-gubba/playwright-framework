export class TokenManager {
  private accessToken?: string;

  /**
   * Stores the current access token for authenticated API requests.
   */
  public setToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Returns the current access token.
   * Throws if no token has been set yet.
   */
  public getToken(): string {
    if (!this.accessToken) {
      throw new Error(
        "Access token is not available. Please authenticate before calling secured APIs.",
      );
    }

    return this.accessToken;
  }

  /**
   * Indicates whether a token is available.
   */
  public hasToken(): boolean {
    return !!this.accessToken;
  }

  /**
   * Clears the current token.
   */
  public clear(): void {
    this.accessToken = undefined;
  }
}
