export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  imageUrl: string;
}

export type UpdateEventRequest = CreateEventRequest;
