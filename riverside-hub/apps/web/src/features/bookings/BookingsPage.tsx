import { FormEvent, useEffect, useState } from "react";
import type { Booking, Resource } from "@riverside/shared";
import {
  fetchResources,
  fetchBookings,
  createBooking,
  cancelBooking,
} from "./bookings.api";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { StatusBadge } from "../../components/StatusBadge";

export function BookingsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    const [resourcesRes, bookingsRes] = await Promise.all([
      fetchResources(),
      fetchBookings(),
    ]);
    setResources(resourcesRes.resources);
    setBookings(bookingsRes.bookings);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedResourceId || !startTime || !endTime) {
      setFormError("Please choose a resource, start time, and end time");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        resourceId: selectedResourceId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        notes: notes || undefined,
      });
      setStartTime("");
      setEndTime("");
      setNotes("");
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(bookingId: string) {
    await cancelBooking(bookingId);
    await loadData();
  }

  function resourceName(resourceId: string) {
    return resources.find((r) => r.id === resourceId)?.name ?? "Unknown resource";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-river-900">Bookings</h1>
      <p className="mt-2 text-ink/70">
        Request a room, equipment, or a gym slot. Staff will approve or
        decline your request based on availability.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl text-river-900">Request a booking</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5 border border-river-900/15 bg-white p-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="resource" className="text-sm font-medium text-river-900">
              Resource
            </label>
            <select
              id="resource"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="border border-river-900/30 bg-white px-3 py-2 focus:border-river-600 focus:outline-none focus:ring-2 focus:ring-river-600/30"
            >
              <option value="">Select a resource…</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type.replace("_", " ")}, capacity {r.capacity})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              id="startTime"
              label="Start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Field
              id="endTime"
              label="End"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Field
            id="notes"
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {formError && <p className="text-sm text-gold-600">{formError}</p>}
          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? "Submitting…" : "Request booking"}
          </Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-river-900">Your bookings</h2>
        {isLoading && <p className="mt-4 text-ink/60">Loading…</p>}
        {!isLoading && bookings.length === 0 && (
          <p className="mt-4 text-ink/60">You don't have any bookings yet.</p>
        )}
        <ul className="mt-4 flex flex-col gap-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between border border-river-900/15 bg-white p-4"
            >
              <div>
                <p className="font-medium text-river-900">{resourceName(b.resourceId)}</p>
                <p className="text-sm text-ink/60">
                  {new Date(b.startTime).toLocaleString()} –{" "}
                  {new Date(b.endTime).toLocaleTimeString()}
                </p>
                {b.notes && <p className="mt-1 text-sm text-ink/50">{b.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status} />
                {b.status === "pending" && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="text-sm text-ink/50 underline hover:text-ink"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
