import { useState } from "react";
import { useCostTrend, useCostByRegion, useCostByProvider, useTopResources } from "../queries/analytics.queries";
import { Card }  from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

function dateStr(d: Date) { return d.toISOString().slice(0, 10); }

export function AnalyticsPage() {
  const now   = new Date();
  const ago30 = new Date(); ago30.setDate(ago30.getDate() - 30);

  const [from, setFrom] = useState(dateStr(ago30));
  const [to,   setTo]   = useState(dateStr(now));

  const params = { from, to };

  const { data: trend,    isLoading: lt } = useCostTrend(params);
  const { data: region,   isLoading: lr } = useCostByRegion(params);
  const { data: provider, isLoading: lp } = useCostByProvider(params);
  const { data: topRes,   isLoading: ltr } = useTopResources(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Detailed cost breakdowns by dimension</p>
      </div>

      {/* Date range picker */}
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <Input label="From" type="date" value={from}
            onChange={(e) => setFrom(e.target.value)} className="w-44"/>
          <Input label="To"   type="date" value={to}
            onChange={(e) => setTo(e.target.value)}   className="w-44"/>
        </div>
      </Card>

      {/* Cost Trend */}
      <Card>
        <h2 className="font-semibold mb-4">Cost Trend</h2>
        {lt ? <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/> : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800"/>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)}/>
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}`}/>
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}/>
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cost by Region */}
        <Card>
          <h2 className="font-semibold mb-4">Cost by Region</h2>
          {lr ? <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={region ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800"/>
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}`}/>
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10 }} width={80}/>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}/>
                <Bar dataKey="amount" fill="#2563eb" radius={[0, 4, 4, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Cost by Provider */}
        <Card>
          <h2 className="font-semibold mb-4">Cost by Provider</h2>
          {lp ? <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={provider ?? []} dataKey="amount" nameKey="provider"
                  cx="50%" cy="50%" outerRadius={80} label={({ provider: p, percent }: { provider: string; percent: number }) =>
                    `${p} ${(percent * 100).toFixed(0)}%`}>
                  {(provider ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`}/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Top 10 resources */}
      <Card>
        <h2 className="font-semibold mb-4">Top 10 Most Expensive Resources</h2>
        {ltr ? <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"/> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["#", "Resource", "Type", "Provider", "Spend"].map((h) => (
                    <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(topRes ?? []).map((r, i) => (
                  <tr key={r.resourceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                    <td className="py-3 px-4 font-medium">{r.resourceName}</td>
                    <td className="py-3 px-4 text-gray-500">{r.resourceType.replace(/_/g, " ")}</td>
                    <td className="py-3 px-4 text-gray-500">{r.provider}</td>
                    <td className="py-3 px-4 font-semibold text-brand-600">${r.amount.toFixed(2)}</td>
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