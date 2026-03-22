import React, { useState, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  UserCheck,
  UserX,
  Copy,
  Check,
} from "lucide-react";
import { useGetAllUsersQuery } from "@/store/api/authApi";
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  profilePic?: string;
  createdAt: string;
}

type RoleFilter         = "all" | "admin" | "user";
type VerificationFilter = "all" | "verified" | "unverified";
type SortKey            = "newest" | "oldest" | "name";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Avatar = ({ user, size = "md" }: { user: User; size?: "sm" | "md" }) => {
  const dim  = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  const init = user.name?.[0]?.toUpperCase() || "U";
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-full border border-slate-100 bg-teal-50 font-bold text-teal-700 flex items-center justify-center", dim)}>
      {user.profilePic
        ? <img src={user.profilePic} alt="" className="h-full w-full object-cover" />
        : init
      }
    </div>
  );
};

const RoleBadge = ({ role }: { role: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
    role === "admin"
      ? "bg-purple-50 text-purple-700 border border-purple-200"
      : "bg-blue-50 text-blue-700 border border-blue-200"
  )}>
    {role === "admin" && <Shield className="h-3 w-3" />}
    {role}
  </span>
);

const VerifiedBadge = ({ verified }: { verified: boolean }) => (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
    verified
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-amber-50 text-amber-700 border border-amber-200"
  )}>
    {verified
      ? <CheckCircle2 className="h-3 w-3" />
      : <XCircle      className="h-3 w-3" />
    }
    {verified ? "Verified" : "Unverified"}
  </span>
);

// ─── Copy button ──────────────────────────────────────────────────────────────

const useCopy = () => {
  const [copiedKey, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return { copiedKey, copy };
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminUsers = () => {
  const usersQuery              = useGetAllUsersQuery();
  const { data: usersRaw, isLoading } = usersQuery;
  const users: User[] = (usersRaw as any)?.data || usersRaw || [];

  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState<RoleFilter>("all");
  const [verifFilter,  setVerifFilter]  = useState<VerificationFilter>("all");
  const [sortBy,       setSortBy]       = useState<SortKey>("newest");
  const { copiedKey, copy }             = useCopy();

  // ── Refresh ────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    try { await usersQuery.refetch(); } catch {}
  }, [usersQuery]);

  usePageRefresh({ page: "users", onRefresh: handleRefresh });

  // ── Filtered + sorted ──────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...users]
      .filter((u) => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      .filter((u) => roleFilter  === "all" || u.role === roleFilter)
      .filter((u) => verifFilter === "all" || (verifFilter === "verified" ? u.isVerified : !u.isVerified))
      .sort((a, b) => {
        if (sortBy === "name")   return a.name.localeCompare(b.name);
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [users, search, roleFilter, verifFilter, sortBy]);

  // ── KPI counts ─────────────────────────────────────────────────────────────

  const kpi = useMemo(() => ({
    total:      users.length,
    admins:     users.filter((u) => u.role === "admin").length,
    verified:   users.filter((u) => u.isVerified).length,
    unverified: users.filter((u) => !u.isVerified).length,
  }), [users]);

  const isFiltered = search.trim() !== "" || roleFilter !== "all" || verifFilter !== "all";

  // ── Row actions dropdown ───────────────────────────────────────────────────

  const UserActions = ({ user }: { user: User }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={() => copy(user.email, `email-${user._id}`)}>
          <div className="flex items-center gap-2">
            {copiedKey === `email-${user._id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            Copy Email
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copy(user._id, `id-${user._id}`)}>
          <div className="flex items-center gap-2">
            {copiedKey === `id-${user._id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            Copy User ID
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSearch(user.email)}>
          Find Similar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage your store's customers and staff.</p>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: "Total Users",  value: kpi.total,      accent: "text-slate-900",   iconBg: "bg-slate-100 text-slate-600",    icon: Users       },
          { label: "Admins",       value: kpi.admins,     accent: "text-purple-700",  iconBg: "bg-purple-50 text-purple-600",   icon: Shield      },
          { label: "Verified",     value: kpi.verified,   accent: "text-emerald-700", iconBg: "bg-emerald-50 text-emerald-600", icon: UserCheck   },
          { label: "Unverified",   value: kpi.unverified, accent: "text-amber-700",   iconBg: "bg-amber-50 text-amber-600",     icon: UserX       },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={cn("mt-1 text-2xl font-bold tabular-nums", s.accent)}>{s.value}</p>
            </div>
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.iconBg)}>
              <s.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                isFiltered
                  ? "border-teal-300 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 3h13l-5 6v4l-3-1.5V9L1.5 3z" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Filter
                {isFiltered && <span className="h-2 w-2 rounded-full bg-teal-500" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Role</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
                {[["all","All roles"],["admin","Admins only"],["user","Users only"]].map(([v,l]) => (
                  <DropdownMenuRadioItem key={v} value={v} className="text-sm">{l}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verification</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={verifFilter} onValueChange={(v) => setVerifFilter(v as VerificationFilter)}>
                {[["all","All users"],["verified","Verified only"],["unverified","Unverified only"]].map(([v,l]) => (
                  <DropdownMenuRadioItem key={v} value={v} className="text-sm">{l}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sort</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                {[["newest","Newest first"],["oldest","Oldest first"],["name","Name A–Z"]].map(([v,l]) => (
                  <DropdownMenuRadioItem key={v} value={v} className="text-sm">{l}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Result count strip */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
          <p className="text-xs font-medium text-slate-500">
            {isFiltered ? `${filtered.length} of ${users.length} users` : `${users.length} users`}
          </p>
          {isFiltered && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("all"); setVerifFilter("all"); }}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Loading / empty */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
            <p className="text-sm text-slate-400">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-7 w-7 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700">{isFiltered ? "No users match" : "No users yet"}</p>
            <p className="text-sm text-slate-400">
              {isFiltered ? "Try adjusting your search or filters." : "Users will appear here once someone registers."}
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ──────────────────────────────────────────── */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["User", "Contact", "Role", "Status", "Joined", ""].map((h) => (
                      <th key={h} className={cn("px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400", h === "" && "text-right")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((user) => (
                    <tr key={user._id} className="group transition-colors hover:bg-slate-50/60">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{user.name}</p>
                            <p className="font-mono text-[10px] text-slate-400">{user._id.slice(-10)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4"><RoleBadge role={user.role} /></td>

                      {/* Status */}
                      <td className="px-5 py-4"><VerifiedBadge verified={user.isVerified} /></td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {format(new Date(user.createdAt), "dd MMM, yyyy")}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <UserActions user={user} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ──────────────────────────────────────────── */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <UserActions user={user} />
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RoleBadge role={user.role} />
                    <VerifiedBadge verified={user.isVerified} />
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {user.phone}
                      </span>
                    )}
                    <span>Joined {format(new Date(user.createdAt), "dd MMM, yyyy")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;