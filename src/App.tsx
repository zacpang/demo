import React, { Suspense, lazy } from "react";
import { Route, Routes, NavLink } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIWorkbench = lazy(() => import("./pages/AIWorkbench"));
const InfluencerHub = lazy(() => import("./pages/InfluencerHub"));
const Accounts = lazy(() => import("./pages/Accounts"));
const StripeResearch = lazy(() => import("./pages/StripeResearch"));
const BPN = lazy(() => import("./pages/BPN"));
const NotFound = lazy(() => import("./pages/NotFound"));

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/ai-workbench", label: "AI工作台" },
  { to: "/influencers", label: "达人互动" },
  { to: "/accounts", label: "账户管理" },
  { to: "/stripe-research", label: "Stripe调研" },
  { to: "/bpn", label: "BPN调研" }
];

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brandBlue"></div>
            <h1 className="text-lg font-semibold">WooshPay Demo Portal</h1>
          </div>
          <nav className="flex items-center gap-2">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-2xl text-sm ${isActive ? "bg-brandBlue text-white" : "hover:bg-gray-100"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Suspense fallback={<div className="card">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai-workbench" element={<AIWorkbench />} />
            <Route path="/influencers" element={<InfluencerHub />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/stripe-research" element={<StripeResearch />} />
            <Route path="/bpn" element={<BPN />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        Demo • Bright UI • Tailwind • React Router • Cursor Ready
      </footer>
    </div>
  );
}
