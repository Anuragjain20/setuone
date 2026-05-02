import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-800 border-purple-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
} as const;

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={`${config.className} font-medium capitalize`}>
      {config.label}
    </Badge>
  );
}
