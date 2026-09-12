import { useEffect, useState } from "react";
import type { Donation, DonationStatus } from "@riverside/shared";
import { fetchDonations, updateDonationStatus } from "../donations/donations.api";
import { StatusBadge } from "../../components/StatusBadge";

const NEXT_STATUS: Record<DonationStatus, DonationStatus | null> = {
  pending: "received",
  received: "allocated",
  allocated: null,
};

const NEXT_LABEL: Record<string, string> = {
  received: "Mark received",
  allocated: "Mark allocated",
};

export function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDonations() {
    const res = await fetchDonations();
    setDonations(res.donations);
    setIsLoading(false);
  }

  useEffect(() => {
    loadDonations();
  }, []);

  async function advance(donation: Donation) {
    const next = NEXT_STATUS[donation.status];
    if (!next) return;
    setError(null);
    try {
      await updateDonationStatus(donation.id, next);
      await loadDonations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update donation");
    }
  }

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-gold-600">{error}</p>}
      {donations.length === 0 && <p className="text-ink/60">No donations yet.</p>}
      <ul className="flex flex-col gap-3">
        {donations.map((d) => {
          const next = NEXT_STATUS[d.status];
          return (
            <li
              key={d.id}
              className="flex items-center justify-between border border-river-900/15 bg-white p-4"
            >
              <div>
                <p className="font-medium text-river-900">
                  {d.type === "monetary" ? `R${d.amount}` : d.itemDescription}
                </p>
                <p className="text-sm text-ink/60">
                  {d.donorName ?? "Member donation"} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={d.status} />
                {next && (
                  <button
                    onClick={() => advance(d)}
                    className="text-sm text-river-600 underline hover:text-river-900"
                  >
                    {NEXT_LABEL[next]}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
