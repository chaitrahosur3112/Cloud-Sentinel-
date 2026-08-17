import { useState } from "react";
import { useResources } from "../queries/resource.queries";
import { Card }    from "../components/ui/Card";
import { Badge }   from "../components/ui/Badge";
import { Button }  from "../components/ui/Button";
import { TableSkeleton } from "../components/ui/Skeleton";

const TYPES = ["", "VIRTUAL_MACHINE", "DATABASE", "STORAGE_BUCKET", "LOAD_BALANCER", "KUBERNETES_CLUSTER", "SERVERLESS_FUNCTION"];
const PROVIDERS = ["", "AWS", "AZURE", "GCP"];

const providerColor: Record<string, "yellow" | "blue" | "green"> = {
  AWS: "yellow", AZURE: "blue", GCP: "green",
};

export function ResourcesPage() {
  const [filters, setFilters] = useState({ type: "", provider: "", page: 1, limit: 20 });
  const { data, isLoading } = useResources(filters);

  const set = (k: keyof typeof filters, v: string | number) =>
    setFilters((f) => ({ ...f, [k]: v, page: k !== "page" ? 1 : Number(v) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-gray-500 text-sm mt-1">All cloud resources across connected accounts</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <select value={filters.type}
            onChange={(e) => set("type", e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {TYPES.map((t) => <option key={t} value={t}>{t || "All Types"}</option>)}
          </select>

          <select value={filters.provider}
            onChange={(e) => set("provider", e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {PROVIDERS.map((p) => <option key={p} value={p}>{p || "All Providers"}</option>)}
          </select>

          <Button variant="secondary" size="sm"
            onClick={() => setFilters({ type: "", provider: "", page: 1, limit: 20 })}>
            Clear filters
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {["Resource", "Type", "Region", "Provider", "Monthly Cost", "Alerts"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-4"><TableSkeleton rows={8}/></td></tr>
              ) : (data?.data ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.accountName}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{r.type.replace(/_/g, " ")}</td>
                  <td className="px-6 py-4 text-gray-500">{r.region ?? "—"}</td>
                  <td className="px-6 py-4">
                    <Badge label={r.provider} color={providerColor[r.provider] ?? "gray"}/>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ${r.currentMonthCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {r.hasOpenAlerts
                      ? <Badge label="Open alerts" color="red"/>
                      : <Badge label="Clear" color="green"/>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              {data.pagination.total} total resources
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary"
                disabled={filters.page <= 1}
                onClick={() => set("page", filters.page - 1)}>
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm">
                {filters.page} / {data.pagination.totalPages}
              </span>
              <Button size="sm" variant="secondary"
                disabled={filters.page >= data.pagination.totalPages}
                onClick={() => set("page", filters.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}