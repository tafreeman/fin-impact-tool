import { useState } from "react";
import { LayoutDashboard, MessageSquare, Users, Settings, ShieldCheck } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import StaffingView from "./components/StaffingView";
import SettingsPanel from "./components/SettingsPanel";
import financialMark from "./assets/financial-engine.svg";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chat", label: "AI Analyst", icon: MessageSquare },
  { id: "staffing", label: "Staffing", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen flex flex-col text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/85 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={financialMark}
              alt=""
              className="h-10 w-10 rounded-lg border border-border bg-surface"
            />
            <div className="min-w-0">
              <p className="section-kicker truncate">Financial Scenario Engine</p>
              <h1 className="truncate text-base font-semibold tracking-tight text-fg sm:text-xl">
                Local-first project finance analysis
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="signal-chip">
              <ShieldCheck size={12} />
              deterministic math
            </span>
            <span className="signal-chip">SQLite local</span>
            <span className="signal-chip">LLM optional</span>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-bg-deep/70 px-4 sm:px-6">
        <nav className="mx-auto grid w-full max-w-[1440px] grid-cols-4 gap-1 sm:flex sm:overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 border-b-2 px-2 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors sm:justify-start sm:px-4 ${
                  isActive
                    ? "border-accent text-fg"
                    : "border-transparent text-muted hover:border-border hover:text-accent-hover"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-fg">
              Scenario command center
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Deterministic TypeScript calculations stay separated from optional AI
              interpretation, so staffing moves, burn-rate checks, and margin analysis
              remain auditable.
            </p>
          </div>
          <div>
            <div className="card panel-pad">
              <p className="section-kicker">Operating model</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Parse intent with AI when enabled. Execute every number in the
                local engine. Store scenarios in SQLite.
              </p>
            </div>
          </div>
        </div>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "chat" && <Chat />}
        {activeTab === "staffing" && <StaffingView />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>

      <footer className="border-t border-border bg-bg-deep px-6 py-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
        Data stored locally in SQLite · PAT transmitted only to models.github.ai via HTTPS when GitHub Models is enabled
      </footer>
    </div>
  );
}
