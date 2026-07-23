import { BaseService } from "./BaseService";
import { ApiEngine } from "../client/ApiEngine";
import {
  CreateEventRequest,
  UpdateEventRequest,
} from "../requests/EventRequest";
import { EventResponse } from "../responses/EventResponse";
import { HttpMethod } from "../types/HttpMethod";
import { API_ENDPOINTS } from "../../constants/APIEndpoints";

export class EventService extends BaseService {
  constructor(api: ApiEngine) {
    super(api);
  }

  public async createEvent(
    request: CreateEventRequest,
  ): Promise<EventResponse> {
    const response = await this.api.execute<EventResponse, CreateEventRequest>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.EVENT.CREATE,
      body: request,
    });

    return response.body;
  }

  public async updateEvent(
    id: number,
    request: UpdateEventRequest,
  ): Promise<EventResponse> {
    const response = await this.api.execute<EventResponse, UpdateEventRequest>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.EVENT.UPDATE(id),
      body: request,
    });

    return response.body;
  }

  public async deleteEvent(id: number): Promise<EventResponse> {
    const response = await this.api.execute<EventResponse>({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.EVENT.DELETE(id),
    });

    return response.body;
  }
}
