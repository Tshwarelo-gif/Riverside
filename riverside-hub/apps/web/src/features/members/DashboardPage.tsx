import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

export function DashboardPage() {
  const { signOut, user, profile, isStaff } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-river-600">Signed in as {user?.email}</p>
          <h1 className="mt-1 font-display text-3xl text-river-900">
            {profile ? `Welcome, ${profile.fullName.split(" ")[0]}` : "Your dashboard"}
          </h1>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-ink/60 underline hover:text-ink"
        >
          Sign out
        </button>
      </div>

      {profile && (
        <div className="mt-10 border border-river-900/15 bg-white p-6">
          <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-ink/50">Full name</dt>
            <dd>{profile.fullName}</dd>
            <dt className="text-ink/50">Email</dt>
            <dd>{profile.email}</dd>
            <dt className="text-ink/50">Phone</dt>
            <dd>{profile.phone ?? "—"}</dd>
            <dt className="text-ink/50">Role</dt>
            <dd className="capitalize">{profile.role}</dd>
            <dt className="text-ink/50">Member since</dt>
            <dd>{new Date(profile.joinedAt).toLocaleDateString()}</dd>
          </dl>
        </div>
      )}

      <nav className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/bookings"
          className="border border-river-900/15 bg-white p-5 transition-colors hover:border-river-600"
        >
          <p className="font-display text-lg text-river-900">Bookings</p>
          <p className="mt-1 text-sm text-ink/60">
            Book a room, equipment, or a gym slot, and manage your requests.
          </p>
        </Link>
        <Link
          to="/donations"
          className="border border-river-900/15 bg-white p-5 transition-colors hover:border-river-600"
        >
          <p className="font-display text-lg text-river-900">Donations</p>
          <p className="mt-1 text-sm text-ink/60">
            Give to the food-parcel drive or make a monetary donation.
          </p>
        </Link>
        {isStaff && (
          <Link
            to="/admin"
            className="col-span-full border border-gold-500/40 bg-gold-500/5 p-5 transition-colors hover:border-gold-500"
          >
            <p className="font-display text-lg text-river-900">Staff dashboard</p>
            <p className="mt-1 text-sm text-ink/60">
              Approve bookings, manage resources, review donations, and view reports.
            </p>
          </Link>
        )}
      </nav>
    </div>
  );
}
