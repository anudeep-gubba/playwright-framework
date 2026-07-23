import { BaseService } from "./BaseService";
import { ApiEngine } from "../client/ApiEngine";
import { CreateEventRequest } from "../requests/EventRequest";
import { EventResponse } from "../responses/EventResponse";
import { HttpMethod } from "../types/HttpMethod";
import { API_ENDPOINTS } from "../../constants/APIEndpoints";

export class EventService extends BaseService {
  constructor(api: ApiEngine) {    super(api);
  }
  public async createEvent(request: CreateEventRequest): Promise<EventResponse> {
    const response = await this.api.execute<EventResponse, CreateEventRequest>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.EVENT.CREATE,
      body: request,
    });

    return response.body;
  }
}
