import { useForecastOrg, useAnomalies } from "../queries/ai.queries";
import { Card }  from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export function AIForecastPage() {
  const { data: forecast, isLoading: lf, error: fe } = useForecastOrg();
  const { data: anomalies, isLoading: la }           = useAnomalies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Forecast</h1>
        <p className="text-gray-500 text-sm mt-1">
          30-day cost forecast powered by Prophet · Anomaly detection powered by Isolation Forest
        </p>
      </div>

      {/* Forecast chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">30-Day Org Cost Forecast</h2>
          {forecast && (
            <div className="flex items-center gap-3">
              <Badge
                label={`Trend: ${forecast.trend}`}
                color={forecast.trend === "increasing" ? "red" : forecast.trend === "decreasing" ? "green" : "blue"}
              />
              <span className="text-sm text-gray-500">
                {forecast.percentChange >= 0 ? "+" : ""}{forecast.percentChange}% over 30 days
              </span>
            </div>
          )}
        </div>

        {lf && <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/>}

        {fe instanceof Error && (
  <div className="flex items-center justify-center h-48 text-gray-400">
    <p className="text-sm">
      Not enough cost history for forecasting (need 14+ days of data)
    </p>
  </div>
)}
        {forecast && !lf && (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={[
                ...forecast.history.map((h) => ({ date: h.date, actual: h.amount })),
                ...forecast.forecast.map((f) => ({
                  date: f.date, predicted: f.predicted,
                  lower: f.lower, upper: f.upper,
                })),
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800"/>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)}/>
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}`}/>
              <Tooltip formatter={(v: number, name: string) => [`$${v?.toFixed(2)}`, name]}/>
              <Legend/>

              {/* Confidence interval band */}
              <Area dataKey="upper" stroke="transparent" fill="#bfdbfe" fillOpacity={0.4} name="Upper bound"/>
              <Area dataKey="lower" stroke="transparent" fill="#ffffff"  fillOpacity={1}  name="Lower bound"/>

              {/* Actual historical line */}
              <Line dataKey="actual"    stroke="#2563eb" strokeWidth={2} dot={false} name="Actual"/>
              {/* Forecast line — dashed */}
              <Line dataKey="predicted" stroke="#f59e0b" strokeWidth={2} dot={false}
                strokeDasharray="5 5" name="Forecast"/>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Anomalies */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Anomaly Detection</h2>
          {anomalies && (
            <Badge
              label={`${anomalies.totalAnomalies} anomalies (${anomalies.anomalyRate}%)`}
              color={anomalies.totalAnomalies > 0 ? "red" : "green"}
            />
          )}
        </div>

        {la && <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/>}

        {anomalies && anomalies.anomalies.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No anomalies detected in the last 90 days.
          </p>
        )}

        {anomalies && anomalies.anomalies.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["Date", "Resource ID", "Amount", "Anomaly Score"].map((h) => (
                    <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {anomalies.anomalies.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">{a.date}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{a.resourceId}</td>
                    <td className="py-3 px-4 font-semibold text-red-500">${a.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-red-500"
                            style={{ width: `${a.anomalyScore * 100}%` }}/>
                        </div>
                        <span className="text-xs text-gray-500">{(a.anomalyScore * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}