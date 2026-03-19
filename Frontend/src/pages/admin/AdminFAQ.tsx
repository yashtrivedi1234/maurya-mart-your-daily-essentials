import { useState } from "react";
import {
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} from "@/store/api/faqApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Plus, Edit } from "lucide-react";

export default function AdminFAQ() {
  const { data: faqs = [], isLoading } = useGetFAQsQuery({});
  const [createFAQ] = useCreateFAQMutation();
  const [updateFAQ] = useUpdateFAQMutation();
  const [deleteFAQ] = useDeleteFAQMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [form, setForm] = useState({ category: "", question: "", answer: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setForm({ category: "", question: "", answer: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (faq: any) => {
    setEditingFaq(faq);
    setForm({ category: faq.category, question: faq.question, answer: faq.answer });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category.trim() || !form.question.trim() || !form.answer.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🚀 " + (editingFaq ? "Updating" : "Creating") + " FAQ...");
      if (editingFaq) {
        console.log("📤 API call: PATCH /api/faq/", editingFaq._id);
        await updateFAQ({ id: editingFaq._id, ...form }).unwrap();
      } else {
        console.log("📤 API call: POST /api/faq/");
        await createFAQ(form).unwrap();
      }
      console.log("✅ FAQ " + (editingFaq ? "updated" : "created") + " successfully");
      setIsOpen(false);
      setForm({ category: "", question: "", answer: "" });
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error: " + (error?.data?.message || error?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("🚀 Deleting FAQ...");
      console.log("📤 API call: DELETE /api/faq/", id);
      await deleteFAQ(id).unwrap();
      console.log("✅ FAQ deleted successfully");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error deleting FAQ: " + (error?.data?.message || error?.message));
    }
  };

  // Group FAQs by category
  const faqsByCategory = faqs.reduce((acc: Record<string, any[]>, faq: any) => {
    const category = faq.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage FAQs</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Create New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Ordering, Delivery, Returns"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input
                  placeholder="Enter the question"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  placeholder="Enter the answer"
                  rows={5}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingFaq ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingFaq ? "Update FAQ" : "Create FAQ"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(faqsByCategory).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No FAQs added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
            <div key={category}>
              <h2 className="text-xl font-bold mb-4">{category}</h2>
              <div className="space-y-3">
                {(categoryFaqs as any[]).map((faq) => (
                  <Card key={faq._id}>
                    <CardContent className="pt-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{faq.answer}</p>
                        <div className="flex gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEdit(faq)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit FAQ</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Category</label>
                                  <Input
                                    placeholder="e.g., Ordering, Delivery, Returns"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Question</label>
                                  <Input
                                    placeholder="Enter the question"
                                    value={form.question}
                                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Answer</label>
                                  <Textarea
                                    placeholder="Enter the answer"
                                    rows={5}
                                    value={form.answer}
                                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Update FAQ"
                                  )}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this FAQ? This cannot be undone.
                              </AlertDialogDescription>
                              <div className="flex gap-2 justify-end">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(faq._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
