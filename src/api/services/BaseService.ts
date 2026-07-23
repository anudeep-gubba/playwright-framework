import { ApiEngine } from "../client/ApiEngine";

export abstract class BaseService {
  protected constructor(protected readonly api: ApiEngine) {}
}
