import { useState, useMemo } from "react";
import { useGetNewslettersQuery } from "@/store/api/newsletterApi";
import {
  Loader2,
  Copy,
  Check,
  Mail,
  Users,
  Calendar,
  Search,
  X,
  Download,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateFull = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Group subscribers by calendar month for the growth stat */
const getMonthlyGrowth = (subscribers: Subscriber[]) => {
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();
  return subscribers.filter((s) => {
    const d = new Date(s.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;
};

/** Download list as CSV */
const downloadCSV = (subscribers: Subscriber[]) => {
  const rows = [
    ["Email", "Subscribed Date"],
    ...subscribers.map((s) => [s.email, formatDateFull(s.createdAt)]),
  ];
  const csv  = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `newsletter-subscribers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Copy button ──────────────────────────────────────────────────────────

const CopyButton = ({
  email,
  id,
  copiedId,
  onCopy,
  compact = false,
}: {
  email: string;
  id: string;
  copiedId: string | null;
  onCopy: (email: string, id: string) => void;
  compact?: boolean;
}) => {
  const copied = copiedId === id;
  return (
    <button
      onClick={() => onCopy(email, id)}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border text-xs font-semibold transition-all",
        compact ? "h-8 px-2.5" : "h-9 px-3",
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
      )}
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5" />{!compact && "Copied"}</>
      ) : (
        <><Copy className="h-3.5 w-3.5" />{!compact && "Copy"}</>
      )}
    </button>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────

export default function AdminNewsletter() {
  const { data: raw = [], isLoading } = useGetNewslettersQuery({});
  const subscribers: Subscriber[] = (raw as any)?.data || raw;

  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const [search,       setSearch]       = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? subscribers.filter((s) => s.email.toLowerCase().includes(q)) : subscribers;
  }, [subscribers, search]);

  const thisMonth = useMemo(() => getMonthlyGrowth(subscribers), [subscribers]);

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = filtered.map((s) => s.email).join("\n");
    navigator.clipboard.writeText(all);
    setCopiedId("__all__");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Loading ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-slate-400">Loading subscribers…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and export your subscriber list for campaigns.
          </p>
        </div>

        {/* Export actions */}
        {subscribers.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={handleCopyAll}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                copiedId === "__all__"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              )}
            >
              {copiedId === "__all__"
                ? <><Check className="h-4 w-4" />Copied!</>
                : <><Copy className="h-4 w-4" />Copy All</>
              }
            </button>
            <button
              onClick={() => downloadCSV(filtered)}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Total subscribers — dark card */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-6 py-5 text-white shadow-md">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Subscribers
            </p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums">{subscribers.length}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* This month */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              This Month
            </p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums text-slate-900">{thisMonth}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Tip card */}
        <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-900">Export for campaigns</p>
            <p className="mt-0.5 text-xs leading-relaxed text-cyan-700">
              Use "Copy All" or "Export CSV" to pull the full list into your email tool.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      {subscribers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Mail className="h-7 w-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-700">
            {search ? "No results found" : "No subscribers yet"}
          </p>
          <p className="text-sm text-slate-400">
            {search
              ? `No email matches "${search}".`
              : "Subscribers will appear here once someone signs up."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Desktop table ─────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
            {/* Table header with result count */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <p className="text-xs font-semibold text-slate-500">
                {search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${filtered.length} subscriber${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                Sorted by latest first
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Subscribed
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((subscriber) => (
                  <tr key={subscriber._id} className="group transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold uppercase text-teal-700">
                          {subscriber.email[0]}
                        </div>
                        <span className="font-medium text-slate-800">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDateFull(subscriber.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <CopyButton
                        email={subscriber.email}
                        id={subscriber._id}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ──────────────────────────────────────────────── */}
          <div className="space-y-2.5 md:hidden">
            {/* Result count */}
            <p className="px-1 text-xs font-semibold text-slate-500">
              {search
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : `${filtered.length} subscriber${filtered.length !== 1 ? "s" : ""}`}
            </p>

            {filtered.map((subscriber) => (
              <div
                key={subscriber._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold uppercase text-teal-700">
                    {subscriber.email[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {subscriber.email}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDate(subscriber.createdAt)}
                    </p>
                  </div>
                </div>
                <CopyButton
                  email={subscriber.email}
                  id={subscriber._id}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                  compact
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}