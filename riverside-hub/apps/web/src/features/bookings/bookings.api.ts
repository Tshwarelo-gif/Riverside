import { apiRequest } from "../../lib/apiClient";
import type {
  Booking,
  CreateBookingInput,
  CreateResourceInput,
  Resource,
  ReviewBookingInput,
  UpdateResourceInput,
} from "@riverside/shared";

export function fetchResources() {
  return apiRequest<{ resources: Resource[] }>("/api/resources");
}

export function fetchAllResources() {
  return apiRequest<{ resources: Resource[] }>("/api/resources/all");
}

export function createResource(input: CreateResourceInput) {
  return apiRequest<{ resource: Resource }>("/api/resources", {
    method: "POST",
    body: input,
  });
}

export function updateResource(resourceId: string, input: UpdateResourceInput) {
  return apiRequest<{ resource: Resource }>(`/api/resources/${resourceId}`, {
    method: "PATCH",
    body: input,
  });
}

export function fetchBookings() {
  return apiRequest<{ bookings: Booking[] }>("/api/bookings");
}

export function createBooking(input: CreateBookingInput) {
  return apiRequest<{ booking: Booking }>("/api/bookings", {
    method: "POST",
    body: input,
  });
}

export function cancelBooking(bookingId: string) {
  return apiRequest<{ booking: Booking }>(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });
}

export function reviewBooking(bookingId: string, input: ReviewBookingInput) {
  return apiRequest<{ booking: Booking }>(`/api/bookings/${bookingId}/review`, {
    method: "PATCH",
    body: input,
  });
}
