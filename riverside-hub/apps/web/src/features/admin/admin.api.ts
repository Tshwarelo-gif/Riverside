import { apiRequest } from "../../lib/apiClient";

export interface SummaryReport {
  totalMembers: number;
  bookingsByStatus: Record<string, number>;
  donations: {
    monetaryTotalPledged: number;
    monetaryTotalReceived: number;
    foodParcelCount: number;
  };
}

export function fetchSummaryReport() {
  return apiRequest<SummaryReport>("/api/admin/reports/summary");
}
