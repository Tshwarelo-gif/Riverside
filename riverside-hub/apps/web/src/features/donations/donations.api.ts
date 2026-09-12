import { apiRequest } from "../../lib/apiClient";
import type {
  CreateDonationInput,
  Donation,
  DonationStatus,
} from "@riverside/shared";

export function fetchDonations() {
  return apiRequest<{ donations: Donation[] }>("/api/donations");
}

export function createDonation(input: CreateDonationInput) {
  return apiRequest<{ donation: Donation }>("/api/donations", {
    method: "POST",
    body: input,
  });
}

export function updateDonationStatus(donationId: string, status: DonationStatus) {
  return apiRequest<{ donation: Donation }>(`/api/donations/${donationId}/status`, {
    method: "PATCH",
    body: { status },
  });
}
