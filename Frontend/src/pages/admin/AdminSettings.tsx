import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ShieldCheck,
  RefreshCw,
  UserCog,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Package,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  Mail,
  Image,
  Info,
  ExternalLink,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Quick-access shortcuts ───────────────────────────────────────────────────

const SHORTCUTS = [
  {
    title:       "Admin Access",
    description: "Review authenticated admin areas and manage user accounts.",
    icon:        UserCog,
    iconBg:      "bg-purple-50 text-purple-600",
    path:        "/admin/users",
    cta:         "Open Users",
  },
  {
    title:       "Store Content",
    description: "Manage FAQs, hero slides, and customer-facing storefront copy.",
    icon:        Settings,
    iconBg:      "bg-teal-50 text-teal-600",
    path:        "/admin/faqs",
    cta:         "Open FAQs",
  },
  {
    title:       "System Safety",
    description: "Use protected routes and refresh tools to keep dashboard data current.",
    icon:        ShieldCheck,
    iconBg:      "bg-emerald-50 text-emerald-600",
    path:        "/admin",
    cta:         "Open Dashboard",
  },
];

// ─── Quick nav links (full admin section map) ─────────────────────────────────

const NAV_SECTIONS = [
  {
    label: "Commerce",
    links: [
      { name: "Products",  icon: Package,      path: "/admin/products"  },
      { name: "Trending",  icon: Flame,        path: "/admin/trending"  },
      { name: "Orders",    icon: ShoppingBag,  path: "/admin/orders"    },
      { name: "Users",     icon: UserCog,      path: "/admin/users"     },
    ],
  },
  {
    label: "Content",
    links: [
      { name: "Hero Section", icon: Sparkles,      path: "/admin/hero"         },
      { name: "Brands",       icon: Image,         path: "/admin/brands"       },
      { name: "FAQs",         icon: HelpCircle,    path: "/admin/faqs"         },
      { name: "Messages",     icon: MessageSquare, path: "/admin/contacts"     },
      { name: "Newsletter",   icon: Mail,          path: "/admin/newsletter"   },
    ],
  },
  {
    label: "Insights",
    links: [
      { name: "Analytics",  icon: BarChart3, path: "/admin/analytics"  },
    ],
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Operational shortcuts and admin controls available in the current build.
        </p>
      </div>

      {/* ── Shortcut cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {SHORTCUTS.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.path)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-400" />

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", item.iconBg)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-teal-600">
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <h2 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Quick navigation map ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
            <ExternalLink className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Quick Navigation</h2>
            <p className="text-xs text-slate-500">Jump to any admin section from here.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="px-5 py-4 sm:px-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.links.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800"
                  >
                    <link.icon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-teal-500" />
                    {link.name}
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-teal-500" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Admin notes ──────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Admin Notes</h2>
            <p className="text-xs text-slate-500">Current build status and known limitations.</p>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          {[
            "The current project does not yet expose a dedicated backend settings API.",
            "This screen groups the operational areas the team requested until deeper settings controls are added.",
            "Use the Quick Navigation panel above to jump to any admin section without returning to the sidebar.",
          ].map((note, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-600">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-600">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Build info strip ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-slate-400" />
          <p className="text-xs font-medium text-slate-500">MaurMart Admin Panel</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700">
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;