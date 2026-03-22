import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Mail,
  MessageSquare,
  ArrowRight,
  Users,
  Inbox,
  MailOpen,
  Archive,
  TrendingUp,
} from "lucide-react";
import { useGetNewslettersQuery } from "@/store/api/newsletterApi";
import { useGetContactsQuery } from "@/store/api/contactApi";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface SectionCard {
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  path: string;
  accent: string;
  iconBg: string;
  cta: string;
  pills: { label: string; value: number; color: string }[];
}

// ─── Main page ─────────────────────────────────────────────────────────────

const AdminNotifications = () => {
  const navigate = useNavigate();

  const { data: newslettersRaw = [] } = useGetNewslettersQuery({});
  const { data: contactsRaw    = [] } = useGetContactsQuery({});

  const newsletters: any[] = (newslettersRaw as any)?.data || (Array.isArray(newslettersRaw) ? newslettersRaw : []);
  const contacts:    any[] = (contactsRaw    as any)?.data || (Array.isArray(contactsRaw)    ? contactsRaw    : []);

  const contactSummary = useMemo(() => ({
    total:    contacts.length,
    newMsg:   contacts.filter((c: any) => c.status === "new").length,
    replied:  contacts.filter((c: any) => c.status === "replied").length,
    archived: contacts.filter((c: any) => c.status === "archived").length,
  }), [contacts]);

  const totalUnread = contactSummary.newMsg;

  // ── Section cards data ──────────────────────────────────────────────────

  const sectionCards: SectionCard[] = [
    {
      title:       "Newsletter Subscribers",
      description: "Customers subscribed to store updates and campaigns.",
      count:       newsletters.length,
      icon:        Mail,
      path:        "/admin/newsletter",
      accent:      "text-teal-600",
      iconBg:      "bg-teal-50 text-teal-600",
      cta:         "View subscribers",
      pills: [
        { label: "Total",       value: newsletters.length, color: "bg-teal-50 text-teal-700 border-teal-200" },
      ],
    },
    {
      title:       "Customer Messages",
      description: "Incoming queries, support requests, and conversations.",
      count:       contactSummary.total,
      icon:        MessageSquare,
      path:        "/admin/contacts",
      accent:      "text-blue-600",
      iconBg:      "bg-blue-50 text-blue-600",
      cta:         "View messages",
      pills: [
        { label: "New",      value: contactSummary.newMsg,   color: "bg-blue-50 text-blue-700 border-blue-200"     },
        { label: "Replied",  value: contactSummary.replied,  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        { label: "Archived", value: contactSummary.archived, color: "bg-slate-100 text-slate-600 border-slate-200"  },
      ],
    },
  ];

  // ── Operational summary stats ───────────────────────────────────────────

  const summaryStats = [
    { label: "Subscribers",      value: newsletters.length,       icon: Users,    iconBg: "bg-teal-50 text-teal-600"    },
    { label: "New Messages",     value: contactSummary.newMsg,    icon: Inbox,    iconBg: "bg-blue-50 text-blue-600"    },
    { label: "Replied",          value: contactSummary.replied,   icon: MailOpen, iconBg: "bg-emerald-50 text-emerald-600" },
    { label: "Archived",         value: contactSummary.archived,  icon: Archive,  iconBg: "bg-slate-100 text-slate-600"  },
  ];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Notifications
          </h1>
          {/* Unread badge */}
          {totalUnread > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              {totalUnread} unread
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Track subscriber updates and customer communication queues.
        </p>
      </div>

      {/* ── Section cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {sectionCards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            {/* Top accent bar */}
            <div className={cn(
              "h-1 w-full bg-gradient-to-r",
              card.path.includes("newsletter")
                ? "from-teal-500 to-cyan-400"
                : "from-blue-500 to-indigo-400"
            )} />

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              {/* Icon + CTA */}
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", card.iconBg)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-semibold transition-colors",
                  "text-slate-400 group-hover:text-teal-600"
                )}>
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>

              {/* Title + description */}
              <h2 className="mt-4 text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{card.description}</p>

              {/* Count */}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                  <p className="mt-0.5 text-3xl font-bold tabular-nums text-slate-900">{card.count}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-slate-200 transition-colors group-hover:text-teal-400" />
              </div>

              {/* Status pills */}
              {card.pills.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {card.pills.map((pill) => (
                    <span
                      key={pill.label}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        pill.color
                      )}
                    >
                      {pill.label}
                      <span className="ml-0.5 font-bold">{pill.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Operational summary ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Bell className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Operational Summary</h2>
            <p className="text-xs text-slate-500">Live snapshot across all notification channels.</p>
          </div>
        </div>

        {/* 4-col grid on sm+, 2-col on mobile */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
          {summaryStats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-3 px-5 py-5 sm:px-6",
                // Remove left divide on first col
                i === 0 && "border-l-0"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                stat.iconBg
              )}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;