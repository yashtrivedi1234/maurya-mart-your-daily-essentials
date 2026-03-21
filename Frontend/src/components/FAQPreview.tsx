import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle } from "lucide-react";
import { useGetFAQsQuery } from "@/store/api/faqApi";

const FAQPreview = () => {
  const { data: faqs = [], isLoading } = useGetFAQsQuery({});
  const previewFaqs = (faqs || []).slice(0, 4);

  if (!isLoading && previewFaqs.length === 0) return null;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <HelpCircle className="h-3.5 w-3.5" />
              Help Center
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">Quick answers before you check out</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Common questions around delivery, payments, returns, and support.
            </p>
          </div>
          <Link to="/faq" className="hidden items-center gap-2 text-sm font-semibold text-primary md:inline-flex">
            View all FAQs <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-3xl bg-card p-6 animate-pulse">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="mt-3 h-4 w-full rounded bg-muted" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                </div>
              ))
            : previewFaqs.map((faq: any) => (
                <div key={faq._id} className="rounded-3xl border bg-card p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{faq.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{faq.answer}</p>
                </div>
              ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link to="/faq" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            View all FAQs <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQPreview;
