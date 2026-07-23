import { ApiScenarioContext } from "./context/ApiScenarioContext";
import { ApiEngine } from "./client/ApiEngine";
import { TokenManager } from "./auth/TokenManager";
import { createApiServices, ApiServiceMap } from "./services";

export class ApiFacade {
  public readonly services: ApiServiceMap;
  public readonly context: ApiScenarioContext;

  private constructor(services: ApiServiceMap, context: ApiScenarioContext) {
    this.services = services;
    this.context = context;
  }

  public static create(apiEngine: ApiEngine, tokenManager: TokenManager): ApiFacade {
    const services = createApiServices(apiEngine, tokenManager);
    const scenarioContext = new ApiScenarioContext();

    return new ApiFacade(services, scenarioContext);
  }

  public setContextValue(key: string, value: unknown): void {
    this.context.set(key, value);
  }

  public getContextValue<T>(key: string): T {
    return this.context.get<T>(key);
  }

  public hasContextValue(key: string): boolean {
    return this.context.has(key);
  }

  public removeContextValue(key: string): void {
    this.context.remove(key);
  }

  public service<T extends keyof ApiServiceMap>(name: T): ApiServiceMap[T] {
    return this.services[name];
  }
}
