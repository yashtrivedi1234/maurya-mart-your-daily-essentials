import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    category: "Ordering",
    questions: [
      { q: "How do I place an order?", a: "You can place an order by browsing our shop, adding items to your cart, and proceeding to checkout. You'll need to create an account or sign in to complete the process." },
      { q: "Can I change or cancel my order?", a: "Orders can be modified or cancelled within 30 minutes of placement. After that, they enter the processing stage and cannot be changed." },
      { q: "What should I do if my payment fails?", a: "If your payment fails, please check your card details and internet connection. If the issue persists, try another payment method or contact your bank." }
    ]
  },
  {
    category: "Delivery",
    questions: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Express delivery (available in select cities) takes 24-48 hours." },
      { q: "Do you offer free delivery?", a: "Yes, we offer free standard delivery on all orders above ₹499." },
      { q: "How Can I track my order?", a: "Once your order is shipped, you will receive a tracking ID via email and SMS. You can also track it in the 'Orders' section of your profile." }
    ]
  },
  {
    category: "Returns",
    questions: [
      { q: "What is your return policy?", a: "We have a 7-day hassle-free return policy for most products. Items must be unused and in their original packaging." },
      { q: "How do I initiate a return?", a: "Go to your Profile > Orders, select the order you want to return, and click on 'Initiate Return'." },
      { q: "When will I get my refund?", a: "Refunds are processed within 5-7 business days after the returned item reaches our warehouse and passes quality check." }
    ]
  }
];

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          Frequently Asked <span className="text-primary">Questions</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          Everything you need to know about shopping at Maur Mart. Can't find the answer? Contact our support team.
        </p>

        <div className="relative group max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search for questions..." 
            className="h-14 pl-12 pr-4 rounded-2xl bg-accent/30 border-border/40 focus:bg-background transition-all"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {faqs.map((category, idx) => (
          <div key={idx}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              {category.category}
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {category.questions.map((faq, fIdx) => (
                <AccordionItem 
                  key={fIdx} 
                  value={`item-${idx}-${fIdx}`}
                  className="bg-card border border-border/40 rounded-2xl px-6 transition-all data-[state=open]:card-shadow"
                >
                  <AccordionTrigger className="hover:no-underline hover:text-primary text-left py-6 font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 rounded-[2rem] bg-foreground text-primary-foreground text-center">
        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
        <p className="text-primary-foreground/60 mb-8">We're here to help you 24/7. Reach out to us through any of our channels.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 h-12 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all">
            Contact Support
          </button>
          <button className="px-8 h-12 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all">
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
