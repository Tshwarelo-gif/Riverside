import { Link } from "react-router-dom";
import { Button } from "../../components/Button";

export function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-sans text-sm uppercase tracking-normal text-river-600">
        Riverside Community Hub
      </p>
      <h1 className="mt-3 font-display text-5xl leading-tight text-river-900">
        One place for our youth programmes, our rooms, and our donations.
      </h1>
      <p className="mt-6 max-w-md text-lg text-ink/70">
        Register as a member to book the gym, meeting rooms, or event space —
        and to support our food-parcel drive.
      </p>
      <div className="mt-8 flex gap-4">
        <Link to="/register">
          <Button>Become a member</Button>
        </Link>
        <Link
          to="/login"
          className="flex items-center px-2 text-river-900 underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
