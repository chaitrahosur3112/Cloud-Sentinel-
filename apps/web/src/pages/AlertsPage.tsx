import { useState } from "react";
import { useAlerts, useAcknowledgeAlert, useResolveAlert } from "../queries/alert.queries";
import { Card }   from "../components/ui/Card";
import { Badge }  from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const STATUS_OPTIONS = ["", "OPEN", "ACKNOWLEDGED", "RESOLVED"];
const TYPE_OPTIONS   = ["", "COST_SPIKE", "BUDGET_EXCEEDED", "IDLE_RESOURCE", "HIGH_CPU_COST", "STORAGE_INCREASE"];

const statusColor: Record<string, "red" | "yellow" | "green" | "gray"> = {
  OPEN:           "red",
  ACKNOWLEDGED:   "yellow",
  RESOLVED:       "green",
};

export function AlertsPage() {
  const [filters, setFilters] = useState({ status: "", type: "", page: 1, limit: 20 });
  const { data, isLoading }   = useAlerts(filters);
  const { mutate: acknowledge } = useAcknowledgeAlert();
  const { mutate: resolve }     = useResolveAlert();

  const set = (k: keyof typeof filters, v: string | number) =>
    setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">Cost anomalies and threshold breaches</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <select value={filters.status} onChange={(e) => set("status", e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => set("type", e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t ? t.replace(/_/g, " ") : "All Types"}</option>)}
          </select>
        </div>
      </Card>

      {/* Alert list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"/>
          ))
        ) : (data?.data ?? []).length === 0 ? (
          <Card><p className="text-center text-gray-500 py-8">No alerts found.</p></Card>
        ) : (
          (data?.data ?? []).map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Badge label={alert.status} color={statusColor[alert.status] ?? "gray"}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {alert.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {alert.status === "OPEN" && (
                    <Button size="sm" variant="secondary"
                      onClick={() => acknowledge(alert.id)}>
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== "RESOLVED" && (
                    <Button size="sm" variant="ghost"
                      onClick={() => resolve(alert.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="secondary" disabled={filters.page <= 1}
            onClick={() => set("page", filters.page - 1)}>Previous</Button>
          <span className="px-3 py-1.5 text-sm">{filters.page} / {data.pagination.totalPages}</span>
          <Button size="sm" variant="secondary" disabled={filters.page >= data.pagination.totalPages}
            onClick={() => set("page", filters.page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}