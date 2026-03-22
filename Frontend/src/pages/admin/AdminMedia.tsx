import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  Images,
  BadgeCheck,
  ArrowRight,
  Upload,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useGetHeroSlidesQuery } from "@/store/api/heroApi";
import { useGetBrandsQuery } from "@/store/api/brandApi";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaCard {
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  path: string;
  accent: string;       // icon bg + text
  preview: string[];    // image urls for thumbnail strip
  cta: string;
}

// ─── Workflow steps ───────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload assets",
    desc: "Add polished hero images or transparent brand logos to the respective section.",
  },
  {
    number: "02",
    icon: Eye,
    title: "Review & publish",
    desc: "Preview your uploads, reorder slides, and confirm brand logos look right.",
  },
  {
    number: "03",
    icon: RefreshCw,
    title: "Go live",
    desc: "Changes propagate to the storefront instantly — no cache flush needed.",
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminMedia = () => {
  const navigate = useNavigate();

  const { data: heroRaw  = [] } = useGetHeroSlidesQuery({});
  const { data: brandsRaw = [] } = useGetBrandsQuery({});

  const heroSlides: any[] = (heroRaw  as any)?.data || (Array.isArray(heroRaw)  ? heroRaw  : []);
  const brands:     any[] = (brandsRaw as any)?.data || (Array.isArray(brandsRaw) ? brandsRaw : []);

  const mediaCards: MediaCard[] = [
    {
      title:       "Hero Slides",
      description: "Manage homepage banners and promotional creatives shown in the top carousel.",
      count:       heroSlides.length,
      icon:        Images,
      path:        "/admin/hero",
      accent:      "bg-teal-50 text-teal-600",
      preview:     heroSlides.slice(0, 3).map((s: any) => s.image).filter(Boolean),
      cta:         "Manage slides",
    },
    {
      title:       "Brand Assets",
      description: "Control partner logos shown in the brand strip and campaign sections.",
      count:       brands.length,
      icon:        BadgeCheck,
      path:        "/admin/brands",
      accent:      "bg-cyan-50 text-cyan-600",
      preview:     brands.slice(0, 3).map((b: any) => b.image).filter(Boolean),
      cta:         "Manage brands",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Media</h1>
        <p className="mt-1 text-sm text-slate-500">
          Central hub for brand assets and homepage visuals.
        </p>
      </div>

      {/* ── Media section cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {mediaCards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            {/* Thumbnail strip */}
            <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-slate-50 sm:h-36">
              {card.preview.length > 0 ? (
                <>
                  {/* Layered image previews */}
                  <div className="flex h-full w-full">
                    {card.preview.map((src, i) => (
                      <div
                        key={i}
                        className="flex-1 overflow-hidden"
                        style={{
                          borderRight: i < card.preview.length - 1 ? "1px solid rgba(255,255,255,0.3)" : "none",
                        }}
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                    {/* Fill remaining slots with slate placeholders */}
                    {Array.from({ length: Math.max(0, 3 - card.preview.length) }).map((_, i) => (
                      <div key={`ph-${i}`} className="flex-1 bg-slate-100" />
                    ))}
                  </div>
                  {/* Count overlay */}
                  <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white backdrop-blur-sm">
                    {card.count}
                  </div>
                </>
              ) : (
                /* Empty state thumbnail */
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <card.icon className="h-10 w-10" />
                  <p className="text-xs font-medium">No assets yet</p>
                </div>
              )}
            </div>

            {/* Card body */}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", card.accent)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors group-hover:text-teal-600">
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5 translate-x-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <h2 className="mt-3.5 text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{card.description}</p>

              <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">{card.count}</p>
                </div>
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  card.count > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {card.count > 0 ? "Live" : "Empty"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Workflow guide ────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
            <ImagePlus className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Media Workflow</h2>
            <p className="text-xs text-slate-500">How to get assets live on the storefront.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex items-start gap-4 px-5 py-5 sm:flex-col sm:gap-3 sm:px-6">
              {/* Step number + icon */}
              <div className="flex shrink-0 items-center gap-3 sm:flex-row sm:items-center">
                <span className="text-2xl font-black tabular-nums text-slate-100 sm:text-3xl">
                  {step.number}
                </span>
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  i === 0 ? "bg-teal-50 text-teal-600"
                  : i === 1 ? "bg-cyan-50 text-cyan-600"
                  : "bg-emerald-50 text-emerald-600"
                )}>
                  <step.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMedia;