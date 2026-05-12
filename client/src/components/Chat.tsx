import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Sparkles, Clock, Zap, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api, type AgenticResponse, type ScenarioResult } from "../api";
import ScenarioCards from "./ScenarioCards";

const QUICK_QUERIES = [
  {
    label: "Staffing Swap",
    query: "What if we replace the Senior Developer on Project Alpha with two Mid-level Developers? Show cost delta, margin impact, and burn rate change.",
  },
  {
    label: "Burn Rate Check",
    query: "What is the monthly burn rate across all projects? Flag any projects where burn rate will exhaust remaining budget within 3 months.",
  },
  {
    label: "Extend + Stay in Budget",
    query: "What staffing changes would let us extend Project Alpha by 3 months and still stay within budget? Explore multiple options.",
  },
  {
    label: "Improve Margin",
    query: "What staffing changes across the portfolio would improve the blended margin by at least 3 percentage points? Try multiple approaches and show the numbers.",
  },
];

export default function Chat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [agenticResponse, setAgenticResponse] = useState<AgenticResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Only refetch history when a new response arrives (not when cleared to null)
    if (agenticResponse) {
      api.getScenarios(20).then(setHistory).catch(() => {});
    }
  }, [agenticResponse]);

  // Initial history load
  useEffect(() => {
    api.getScenarios(20).then(setHistory).catch(() => {});
  }, []);

  const runQuery = async (q?: string) => {
    const finalQuery = q || query;
    if (!finalQuery.trim() || loading) return;

    setLoading(true);
    setAgenticResponse(null);
    setError(null);
    setExpandedScenario(null);

    try {
      const result = await api.runScenarioV3(finalQuery);
      if (result.error) {
        setError(result.error);
      } else {
        setAgenticResponse(result);
      }
      if (!q) setQuery("");
    } catch (e: any) {
      setError(e.message);
      if (!q) setQuery("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      runQuery();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="card panel-pad">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">AI Analyst</p>
              <h2 className="section-title mt-1">Ask a scenario question</h2>
            </div>
            <span className="signal-chip">engine-backed</span>
          </div>
          <label className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Scenario Question
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What staffing changes would let us extend Alpha by 3 months and stay within budget?"
              rows={3}
              className="input-field pr-12 resize-none"
              disabled={loading}
            />
            <button
              onClick={() => runQuery()}
              disabled={loading || !query.trim()}
              className="absolute bottom-2 right-2 rounded-md bg-accent p-2 text-white
                         transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">Ctrl+Enter to send</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => { setQuery(q.query); runQuery(q.query); }}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5
                         text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent-hover
                         disabled:opacity-50"
            >
              <Sparkles size={12} />
              {q.label}
            </button>
          ))}
        </div>

        {/* Response */}
        {loading && (
          <div className="card p-8 text-center">
            <Loader2 size={24} className="mx-auto mb-2 animate-spin text-accent" />
            <p className="text-sm text-muted">Analyzing scenarios...</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">The AI is exploring options using the calculation engine</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {agenticResponse && (
          <div className="space-y-4">
            {/* Scenarios explored badge */}
            {agenticResponse.scenarios_explored.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="signal-chip">
                  <Zap size={10} />
                  {agenticResponse.scenarios_explored.length} scenario{agenticResponse.scenarios_explored.length !== 1 ? "s" : ""} computed
                </span>
                <span className="font-mono text-[10px] text-dim">
                  {agenticResponse.tokensUsed?.toLocaleString()} tokens · {agenticResponse.model}
                </span>
              </div>
            )}

            {/* Expandable scenario cards for each explored scenario */}
            {agenticResponse.scenarios_explored.length > 0 && (
              <div className="space-y-2">
                {agenticResponse.scenarios_explored.map((scenario, i) => (
                  <ScenarioAccordion
                    key={i}
                    index={i}
                    scenario={scenario}
                    isExpanded={expandedScenario === i}
                    onToggle={() => setExpandedScenario(expandedScenario === i ? null : i)}
                  />
                ))}
              </div>
            )}

            {/* AI narrative */}
            {agenticResponse.content && (
              <div className="card">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 pt-5">
                  <span className="section-kicker">
                    AI Analysis
                  </span>
                  <span className="font-mono text-[10px] text-dim">
                    {agenticResponse.model}
                  </span>
                </div>
                <div className="p-5">
                  <div className="ai-response">
                    <ReactMarkdown>{agenticResponse.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 pt-5">
            <span className="section-kicker flex items-center gap-1.5">
              <Clock size={12} /> History
            </span>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:text-accent-hover"
            >
              {showHistory ? "Collapse" : "Expand"}
            </button>
          </div>
          <div className="max-h-[600px] divide-y divide-border-soft overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted">No queries yet</div>
            ) : (
              history.map((h: any) => (
                <button
                  key={h.id}
                  onClick={() => setQuery(h.query)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-surface-2"
                >
                  <p className="line-clamp-2 text-xs font-medium text-fg">{h.query}</p>
                  <p className="mt-1 font-mono text-[10px] text-dim">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                  {showHistory && (
                    <p className="mt-2 line-clamp-3 text-[11px] text-muted">{h.response?.slice(0, 200)}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion for explored scenarios ────────────────────────────────────────

function ScenarioAccordion({ index, scenario, isExpanded, onToggle }: {
  index: number;
  scenario: ScenarioResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const action = scenario.operation?.action ?? "analysis";
  const project = scenario.project_name ?? scenario.projects_involved?.join(", ") ?? "Portfolio";
  const hasImpact = !!scenario.impact;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-surface-2/70"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {index + 1}
          </span>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fg">
            {action.replace(/_/g, " ")}
          </span>
          <span className="truncate text-xs text-muted">— {project}</span>
        </div>
        <div className="flex items-center gap-3">
          {hasImpact && (
            <span className={`text-xs font-mono font-semibold ${
              scenario.impact!.cost_delta_monthly <= 0 ? "text-emerald-500" : "text-red-500"
            }`}>
              {scenario.impact!.cost_delta_monthly >= 0 ? "+" : ""}
              ${Math.round(scenario.impact!.cost_delta_monthly).toLocaleString()}/mo
            </span>
          )}
          {isExpanded ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-border p-4">
          <ScenarioCards result={scenario} />
        </div>
      )}
    </div>
  );
}
