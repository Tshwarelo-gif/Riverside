import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/admin", label: "Reports", end: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/resources", label: "Resources" },
  { to: "/admin/donations", label: "Donations" },
];

export function AdminLayout() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm text-gold-600">Staff dashboard</p>
      <h1 className="mt-1 font-display text-3xl text-river-900">
        Riverside operations
      </h1>

      <nav className="mt-8 flex gap-1 border-b border-river-900/15">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-river-900 text-river-900"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
