export interface EventData {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventResponse {
  success: boolean;
  data: EventData;
  message: string;
}
