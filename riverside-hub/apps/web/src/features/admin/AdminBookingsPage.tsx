import { useEffect, useState } from "react";
import type { Booking, Resource } from "@riverside/shared";
import { fetchBookings, fetchResources, reviewBooking } from "../bookings/bookings.api";
import { StatusBadge } from "../../components/StatusBadge";

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadData() {
    const [bookingsRes, resourcesRes] = await Promise.all([
      fetchBookings(),
      fetchResources(),
    ]);
    setBookings(bookingsRes.bookings);
    setResources(resourcesRes.resources);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleReview(bookingId: string, status: "approved" | "rejected") {
    setActionError(null);
    try {
      await reviewBooking(bookingId, { status });
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    }
  }

  function resourceName(resourceId: string) {
    return resources.find((r) => r.id === resourceId)?.name ?? "Unknown resource";
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const others = bookings.filter((b) => b.status !== "pending");

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="flex flex-col gap-10">
      {actionError && <p className="text-sm text-gold-600">{actionError}</p>}

      <section>
        <h2 className="font-display text-lg text-river-900">
          Pending approval ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="mt-3 text-ink/60">Nothing waiting on you right now.</p>
        )}
        <ul className="mt-3 flex flex-col gap-3">
          {pending.map((b) => (
            <li key={b.id} className="flex items-center justify-between border border-river-900/15 bg-white p-4">
              <div>
                <p className="font-medium text-river-900">{resourceName(b.resourceId)}</p>
                <p className="text-sm text-ink/60">
                  {new Date(b.startTime).toLocaleString()} –{" "}
                  {new Date(b.endTime).toLocaleTimeString()}
                </p>
                {b.notes && <p className="mt-1 text-sm text-ink/50">{b.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(b.id, "approved")}
                  className="bg-river-900 px-3 py-1.5 text-sm text-paper hover:bg-river-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview(b.id, "rejected")}
                  className="border border-river-900/30 px-3 py-1.5 text-sm text-river-900 hover:border-river-900"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg text-river-900">History</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {others.map((b) => (
            <li key={b.id} className="flex items-center justify-between border border-river-900/15 bg-white p-4">
              <div>
                <p className="font-medium text-river-900">{resourceName(b.resourceId)}</p>
                <p className="text-sm text-ink/60">
                  {new Date(b.startTime).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
