const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold-500/15 text-gold-600",
  approved: "bg-river-600/15 text-river-700",
  received: "bg-river-600/15 text-river-700",
  allocated: "bg-river-900/10 text-river-900",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-ink/10 text-ink/50",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-ink/10 text-ink/60";
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
