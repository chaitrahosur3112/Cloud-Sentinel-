import {
  useDashboardSummary, useRecentAlerts, useDailyCosts,
  useMonthlyCosts, useBudgetStatus,
} from "../queries/dashboard.queries";
import { Card }    from "../components/ui/Card";
import { Badge }   from "../components/ui/Badge";
import { CardSkeleton } from "../components/ui/Skeleton";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

function StatCard({ label, value, sub, accent = false }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <Card>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? "text-brand-600" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </Card>
  );
}

const alertColor: Record<string, "red" | "yellow" | "blue" | "gray"> = {
  COST_SPIKE:       "red",
  BUDGET_EXCEEDED:  "red",
  IDLE_RESOURCE:    "yellow",
  HIGH_CPU_COST:    "yellow",
  STORAGE_INCREASE: "blue",
};

export function DashboardPage() {
  const { data: summary,  isLoading: loadingSummary  } = useDashboardSummary();
  const { data: alerts,   isLoading: loadingAlerts   } = useRecentAlerts();
  const { data: daily,    isLoading: loadingDaily    } = useDailyCosts();
  const { data: monthly,  isLoading: loadingMonthly  } = useMonthlyCosts();
  const { data: budgets,  isLoading: loadingBudgets  } = useBudgetStatus();

  const fmt = (n?: number) => n !== undefined ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your cloud cost overview at a glance
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Monthly Spend"   value={fmt(summary?.costs.currentMonth)} accent />
            <StatCard label="This Week"       value={fmt(summary?.costs.currentWeek)} />
            <StatCard label="Today"           value={fmt(summary?.costs.today)} />
            <StatCard label="Potential Savings" value={fmt(summary?.savings.potential)}
              sub={`${summary?.budgets.exceeded ?? 0} budgets exceeded`} />
          </>
        )}
      </div>

      {/* Resource stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingSummary ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Resources"  value={String(summary?.resources.total ?? 0)} />
            <StatCard label="Active Resources" value={String(summary?.resources.active ?? 0)} />
            <StatCard label="Unused Resources" value={String(summary?.resources.unused ?? 0)} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4">Daily Spend — Last 30 Days</h2>
          {loadingDaily ? (
            <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800"/>
                <XAxis dataKey="date" tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}`}/>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}/>
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Monthly Spend — Last 12 Months</h2>
          {loadingMonthly ? (
            <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800"/>
                <XAxis dataKey="month" tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(0, 7)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}`}/>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}/>
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Budget status + Recent alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4">Budget Status</h2>
          {loadingBudgets ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse bg-gray-100 dark:bg-gray-800 rounded"/>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(budgets ?? []).map((b) => (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{b.name}</span>
                    <span className={b.isExceeded ? "text-red-500 font-semibold" : "text-gray-500"}>
                      {b.percentUsed}% used
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${b.isExceeded ? "bg-red-500" : "bg-brand-500"}`}
                      style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>${b.spent.toLocaleString()} spent</span>
                    <span>${b.monthlyLimit.toLocaleString()} limit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Recent Alerts</h2>
          {loadingAlerts ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse bg-gray-100 dark:bg-gray-800 rounded"/>
              ))}
            </div>
          ) : (alerts ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {(alerts ?? []).slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <Badge label={a.type.replace(/_/g, " ")}
                    color={alertColor[a.type] ?? "gray"} />
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    {a.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}