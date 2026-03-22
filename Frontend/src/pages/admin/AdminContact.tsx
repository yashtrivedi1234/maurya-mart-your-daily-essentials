import { useState, useMemo } from "react";
import {
  useGetContactsQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} from "@/store/api/contactApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Trash2,
  Eye,
  MailOpen,
  Inbox,
  Archive,
  MessageSquare,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "replied" | "archived" | string;
  createdAt: string;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  new:      { label: "New",      bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    border: "border-blue-200"    },
  replied:  { label: "Replied",  bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  archived: { label: "Archived", bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400",   border: "border-slate-200"   },
} as const;

const ALL_STATUSES = ["new", "replied", "archived"] as const;

const getStatusCfg = (s: string) =>
  STATUS_CFG[s as keyof typeof STATUS_CFG] ?? STATUS_CFG.new;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = getStatusCfg(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        cfg.bg, cfg.text, cfg.border
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
  iconBg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-1.5 text-3xl font-bold tabular-nums", accent)}>{value}</p>
    </div>
    <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
      <Icon className="h-5 w-5" />
    </div>
  </div>
);

// ─── Message detail dialog ────────────────────────────────────────────────────

const MessageDialog = ({
  contact,
  open,
  onClose,
  onStatusChange,
}: {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) => {
  const [localStatus, setLocalStatus] = useState(contact?.status ?? "new");

  // Sync local when contact changes
  if (contact && localStatus !== contact.status && !open) {
    setLocalStatus(contact.status);
  }

  const handleStatus = (status: string) => {
    if (!contact) return;
    setLocalStatus(status);
    onStatusChange(contact._id, status);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-xl gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-base font-bold text-slate-900">
            Message Details
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Full message and status management.
          </DialogDescription>
        </DialogHeader>

        {contact && (
          <div className="space-y-5 px-6 py-5 max-h-[80vh] overflow-y-auto">
            {/* Sender info */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: User,     label: "Name",    value: contact.name },
                { icon: Mail,     label: "Email",   value: contact.email },
                { icon: Phone,    label: "Phone",   value: contact.phone || "—" },
                { icon: Calendar, label: "Date",    value: formatDate(contact.createdAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subject */}
            {contact.subject && (
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Subject
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">{contact.subject}</p>
                </div>
              </div>
            )}

            {/* Message body */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Message
              </p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {contact.message}
              </div>
            </div>

            {/* Status update */}
            <div>
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => {
                  const cfg = getStatusCfg(s);
                  const isActive = localStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all",
                        isActive
                          ? cn(cfg.bg, cfg.text, cfg.border, "shadow-sm")
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminContact() {
  const { data: raw = [], isLoading } = useGetContactsQuery({});
  const [updateStatus] = useUpdateContactStatusMutation();
  const [deleteContact] = useDeleteContactMutation();

  const contacts: Contact[] = (raw as any)?.data || raw;

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [activeFilter, setActiveFilter]       = useState<string>("all");
  const [error, setError]                     = useState("");

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(
    () => activeFilter === "all" ? contacts : contacts.filter((c) => c.status === activeFilter),
    [contacts, activeFilter]
  );

  // ── Stats ──────────────────────────────────────────────────────────────────

  const counts = useMemo(() => ({
    new:      contacts.filter((c) => c.status === "new").length,
    replied:  contacts.filter((c) => c.status === "replied").length,
    archived: contacts.filter((c) => c.status === "archived").length,
  }), [contacts]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      if (selectedContact?._id === id) {
        setSelectedContact((c) => c ? { ...c, status } : c);
      }
    } catch (err: any) {
      setError("Status update failed: " + (err?.data?.message || err?.message));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id).unwrap();
      if (selectedContact?._id === id) { setDialogOpen(false); setSelectedContact(null); }
    } catch (err: any) {
      setError("Delete failed: " + (err?.data?.message || err?.message));
    }
  };

  const openDetail = (contact: Contact) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-slate-400">Loading messages…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Contact Messages
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {contacts.length} total {contacts.length === 1 ? "message" : "messages"} from customers.
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="New"      value={counts.new}      icon={Inbox}    accent="text-blue-700"    iconBg="bg-blue-50 text-blue-600"     />
        <StatCard label="Replied"  value={counts.replied}  icon={MailOpen} accent="text-emerald-700" iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Archived" value={counts.archived} icon={Archive}  accent="text-slate-700"   iconBg="bg-slate-100 text-slate-500"   />
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="rounded p-0.5 hover:bg-rose-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        <Filter className="h-4 w-4 shrink-0 text-slate-400" />
        {[
          { key: "all",      label: "All",      count: contacts.length },
          { key: "new",      label: "New",      count: counts.new },
          { key: "replied",  label: "Replied",  count: counts.replied },
          { key: "archived", label: "Archived", count: counts.archived },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
              activeFilter === key
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            {label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                activeFilter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <MessageSquare className="h-7 w-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-700">No messages found</p>
          <p className="text-sm text-slate-400">
            {activeFilter === "all"
              ? "No contact messages received yet."
              : `No messages with status "${activeFilter}".`}
          </p>
        </div>
      )}

      {/* ── Desktop table ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {["Sender", "Subject", "Date", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400",
                        h === "" && "text-right"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((contact) => (
                  <tr
                    key={contact._id}
                    className={cn(
                      "group transition-colors hover:bg-slate-50/60",
                      contact.status === "new" && "bg-blue-50/20"
                    )}
                  >
                    {/* Sender */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold uppercase text-teal-700">
                          {contact.name?.[0] ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{contact.name}</p>
                          <p className="truncate text-xs text-slate-400">{contact.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="max-w-[200px] px-5 py-4">
                      <p className="truncate text-slate-700">{contact.subject || "—"}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{contact.message}</p>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      {formatDate(contact.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={contact.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetail(contact)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                          title="View message"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-sm rounded-2xl">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                              <Trash2 className="h-5 w-5" />
                            </div>
                            <AlertDialogTitle className="mt-3 text-base font-bold text-slate-900">
                              Delete message?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-slate-500">
                              This message will be permanently deleted and cannot be recovered.
                            </AlertDialogDescription>
                            <div className="mt-2 flex gap-3">
                              <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(contact._id)}
                                className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ──────────────────────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {filtered.map((contact) => (
              <div
                key={contact._id}
                className={cn(
                  "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm",
                  contact.status === "new" && "border-blue-100 bg-blue-50/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold uppercase text-teal-700">
                      {contact.name?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">{contact.name}</p>
                      <p className="truncate text-xs text-slate-400">{contact.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={contact.status} />
                </div>

                {contact.subject && (
                  <p className="mt-3 text-sm font-medium text-slate-700">{contact.subject}</p>
                )}
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{contact.message}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDate(contact.createdAt)}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openDetail(contact)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-sm rounded-2xl">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                        <Trash2 className="h-5 w-5" />
                      </div>
                      <AlertDialogTitle className="mt-3 text-base font-bold text-slate-900">
                        Delete message?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-slate-500">
                        This message will be permanently removed.
                      </AlertDialogDescription>
                      <div className="mt-2 flex gap-3">
                        <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(contact._id)}
                          className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Message detail dialog ──────────────────────────────────────────── */}
      <MessageDialog
        contact={selectedContact}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedContact(null); }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}