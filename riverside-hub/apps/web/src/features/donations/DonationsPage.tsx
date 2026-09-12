import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { fetchDonations, createDonation } from "./donations.api";
import type { Donation, DonationType } from "@riverside/shared";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { StatusBadge } from "../../components/StatusBadge";

export function DonationsPage() {
  const { user } = useAuth();

  const [type, setType] = useState<DonationType>("monetary");
  const [amount, setAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorContact, setDonorContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [history, setHistory] = useState<Donation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  async function loadHistory() {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetchDonations();
      setHistory(res.donations);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user && !donorName) {
      setError("Please enter your name (or sign in) so staff know who to thank");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonation({
        type,
        amount: type === "monetary" ? Number(amount) : undefined,
        itemDescription: type === "food_parcel" ? itemDescription : undefined,
        donorName: donorName || undefined,
        donorContact: donorContact || undefined,
      });
      setSuccess(true);
      setAmount("");
      setItemDescription("");
      setDonorName("");
      setDonorContact("");
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Donation could not be recorded");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-river-900">Support Riverside</h1>
      <p className="mt-2 text-ink/70">
        Every contribution — cash or a food parcel — goes straight back into
        our youth programmes and community drive.
        {!user && " You don't need an account to donate."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 border border-river-900/15 bg-white p-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={type === "monetary"}
              onChange={() => setType("monetary")}
            />
            Monetary donation
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={type === "food_parcel"}
              onChange={() => setType("food_parcel")}
            />
            Food parcel
          </label>
        </div>

        {type === "monetary" ? (
          <Field
            id="amount"
            label="Amount (ZAR)"
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        ) : (
          <Field
            id="itemDescription"
            label="What are you donating?"
            placeholder="e.g. 5kg maize meal, tinned goods, cooking oil"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
          />
        )}

        {!user && (
          <>
            <Field
              id="donorName"
              label="Your name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              required
            />
            <Field
              id="donorContact"
              label="Contact (phone or email, optional)"
              value={donorContact}
              onChange={(e) => setDonorContact(e.target.value)}
            />
          </>
        )}

        {error && <p className="text-sm text-gold-600">{error}</p>}
        {success && (
          <p className="text-sm text-river-600">
            Thank you — your donation has been recorded.
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Submitting…" : "Donate"}
        </Button>
      </form>

      {user && (
        <section className="mt-12">
          <h2 className="font-display text-xl text-river-900">Your donation history</h2>
          {isLoadingHistory && <p className="mt-4 text-ink/60">Loading…</p>}
          {!isLoadingHistory && history.length === 0 && (
            <p className="mt-4 text-ink/60">No donations yet.</p>
          )}
          <ul className="mt-4 flex flex-col gap-3">
            {history.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between border border-river-900/15 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-river-900">
                    {d.type === "monetary" ? `R${d.amount}` : d.itemDescription}
                  </p>
                  <p className="text-sm text-ink/50">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
