import { useParams, useNavigate } from "react-router-dom";
import { useQuery }               from "react-query";
import { api }                    from "../lib/axios";
import { Card }                   from "../components/ui/Card";
import { Badge }                  from "../components/ui/Badge";
import { Button }                 from "../components/ui/Button";
import { CardSkeleton }           from "../components/ui/Skeleton";
import { ResourceDetail }         from "../types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const providerColor: Record<string, "yellow" | "blue" | "green"> = {
  AWS: "yellow", AZURE: "blue", GCP: "green",
};

const alertColor: Record<string, "red" | "yellow" | "blue" | "gray"> = {
  COST_SPIKE:       "red",
  BUDGET_EXCEEDED:  "red",
  IDLE_RESOURCE:    "yellow",
  HIGH_CPU_COST:    "yellow",
  STORAGE_INCREASE: "blue",
};

export function ResourceDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch resource detail
  const { data: resource, isLoading: loadingResource } = useQuery(
    ["resource", id],
    async () => {
      const { data } = await api.get(`/resources/${id}`);
      return data.data as ResourceDetail;
    },
    { enabled: !!id }
  );

  // Fetch cost history
  const { data: costHistory, isLoading: loadingCosts } = useQuery(
    ["resource-costs", id],
    async () => {
      const { data } = await api.get(`/resources/${id}/costs`);
      return data.data as {
        resourceId:   string;
        resourceName: string;
        history: Array<{ date: string; amount: number }>;
      };
    },
    { enabled: !!id }
  );

  if (loadingResource) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">Resource not found</p>
        <Button variant="secondary" onClick={() => navigate("/resources")}>
          Back to Resources
        </Button>
      </div>
    );
  }

  const totalCost = costHistory?.history.reduce((s, h) => s + h.amount, 0) ?? 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/resources")}
            className="flex items-center gap-1 text-sm text-gray-500
              hover:text-brand-600 transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Resources
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {resource.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge label={resource.provider} color={providerColor[resource.provider] ?? "gray"}/>
            <Badge label={resource.type.replace(/_/g, " ")} color="blue"/>
            {resource.region && (
              <span className="text-sm text-gray-500">{resource.region}</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">This month</p>
          <p className="text-3xl font-bold text-brand-600">
            ${resource.currentMonthCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account</p>
          <p className="font-semibold text-sm">{resource.accountName}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Provider</p>
          <p className="font-semibold text-sm">{resource.provider}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
          <p className="font-semibold text-sm">{resource.type.replace(/_/g, " ")}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">90-Day Total</p>
          <p className="font-semibold text-sm">${totalCost.toFixed(2)}</p>
        </Card>
      </div>

      {/* Cost history chart */}
      <Card>
        <h2 className="font-semibold mb-4">Cost History — Last 90 Days</h2>
        {loadingCosts ? (
          <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/>
        ) : !costHistory || costHistory.history.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <p className="text-sm">No cost history available for this resource</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={costHistory.history}>
              <CartesianGrid strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-800"/>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              />
              <Tooltip
                formatter={(v: number) => [`$${v.toFixed(4)}`, "Daily Cost"]}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Alerts + Recommendations side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Open Alerts */}
        <Card>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            Open Alerts
            {resource.alerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white
                text-xs flex items-center justify-center">
                {resource.alerts.length}
              </span>
            )}
          </h2>
          {resource.alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              <p className="text-sm">No open alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resource.alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <Badge label={a.type.replace(/_/g, " ")}
                    color={alertColor[a.type] ?? "gray"}/>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {a.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            Cost Recommendations
            {resource.recommendations.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white
                text-xs flex items-center justify-center">
                {resource.recommendations.length}
              </span>
            )}
          </h2>
          {resource.recommendations.length === 0 ? (
            <p className="text-sm text-gray-400">No recommendations at this time</p>
          ) : (
            <div className="space-y-3">
              {resource.recommendations.map((rec) => (
                <div key={rec.id}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20
                    border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.description}
                  </p>
                  <p className="text-xs font-semibold text-green-600
                    dark:text-green-400 mt-1">
                    Potential saving: ${rec.estimatedSavings.toFixed(2)}/month
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