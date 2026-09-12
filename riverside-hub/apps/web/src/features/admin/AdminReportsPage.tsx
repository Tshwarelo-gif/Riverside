import { useEffect, useState } from "react";
import { fetchSummaryReport, SummaryReport } from "./admin.api";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-river-900/15 bg-white p-5">
      <p className="text-sm text-ink/50">{label}</p>
      <p className="mt-1 font-display text-2xl text-river-900">{value}</p>
    </div>
  );
}

export function AdminReportsPage() {
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryReport()
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load report"));
  }, []);

  if (error) return <p className="text-gold-600">{error}</p>;
  if (!report) return <p className="text-ink/60">Loading report…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-lg text-river-900">Membership</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total members" value={report.totalMembers} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg text-river-900">Bookings by status</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["pending", "approved", "rejected", "cancelled"].map((status) => (
            <StatCard
              key={status}
              label={status}
              value={report.bookingsByStatus[status] ?? 0}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg text-river-900">Donations</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Monetary pledged"
            value={`R${report.donations.monetaryTotalPledged.toFixed(2)}`}
          />
          <StatCard
            label="Monetary received"
            value={`R${report.donations.monetaryTotalReceived.toFixed(2)}`}
          />
          <StatCard label="Food parcels" value={report.donations.foodParcelCount} />
        </div>
      </div>
    </div>
  );
}
