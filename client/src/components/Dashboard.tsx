import { useState, useEffect } from "react";
import { DollarSign, TrendingDown, Users, AlertTriangle } from "lucide-react";
import { api } from "../api";
import { fmt } from "../format";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-muted">Loading financial model...</div>;
  if (!data) return <div className="py-12 text-center text-red-500">Failed to load</div>;

  const { summary, projects } = data;

  const stats = [
    { label: "Total Budget", value: fmt(summary.totalBudget), icon: DollarSign, color: "text-emerald-500" },
    { label: "Monthly Burn", value: fmt(summary.totalMonthlyBurn), icon: TrendingDown, color: "text-amber-500" },
    { label: "Blended Margin", value: `${summary.blendedMargin}%`, icon: DollarSign, color: summary.blendedMargin > 25 ? "text-emerald-500" : "text-red-500" },
    { label: "Headcount", value: summary.headcount, icon: Users, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Portfolio state</p>
          <h2 className="section-title mt-1">Budget, burn, margin, headcount</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          Current project health calculated from local project, staffing, and rate data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card panel-pad">
              <div className="mb-3 flex items-center justify-between">
                <span className="stat-label">{s.label}</span>
                <Icon size={17} className={s.color} />
              </div>
              <div className={`stat-value text-2xl sm:text-3xl ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 pt-5">
          <div>
            <p className="section-kicker">Project table</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Budget overview</h2>
          </div>
          <span className="signal-chip">{projects.length} active rows</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th className="text-right">Budget</th>
                <th className="text-right">Spent</th>
                <th className="text-right">Remaining</th>
                <th className="text-right">Burn/Mo</th>
                <th className="text-right">Months Left</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p: any) => {
                const pctSpent = p.total_budget > 0 ? (p.spent_to_date / p.total_budget) * 100 : 0;
                const isRisk = p.months_left < 3 && p.months_left > 0;
                return (
                  <tr key={p.id}>
                    <td className="font-medium text-fg">{p.name}</td>
                    <td className="text-right font-mono text-xs">{fmt(p.total_budget)}</td>
                    <td className="text-right font-mono text-xs text-muted">{fmt(p.spent_to_date)}</td>
                    <td className="text-right font-mono text-xs">{fmt(p.remaining)}</td>
                    <td className="text-right font-mono text-xs">{fmt(p.monthly_burn)}</td>
                    <td className="text-right font-mono text-xs">{p.months_left.toFixed(1)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-deep">
                          <div
                            className={`h-full rounded-full ${
                              pctSpent > 80 ? "bg-red-500" : pctSpent > 60 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(pctSpent, 100)}%` }}
                          />
                        </div>
                        {isRisk && (
                          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
