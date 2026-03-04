import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Save, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Admin() {
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load existing images from localStorage on mount
    const savedImages = localStorage.getItem("heroSliderImages");
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (e) {
        console.error("Failed to parse saved images", e);
      }
    }
  }, []);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }
    
    // Add simple validation if needed, for instance, checking if it starts with http
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = () => {
    localStorage.setItem("heroSliderImages", JSON.stringify(images));
    toast({
      title: "Success",
      description: "Hero slider images have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <ImageIcon className="w-8 h-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2">Manage your store's configuration and content.</p>
          </div>
          <Button onClick={handleSave} className="gap-2" size="lg">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold mb-1">Hero Slider Images</h2>
            <p className="text-sm text-muted-foreground">Add or remove images displayed in the main homepage slider.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Add New Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                />
              </div>
              <Button onClick={handleAddImage} variant="secondary" className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground">No images added yet.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Add some image URLs above to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="group relative rounded-lg border border-border overflow-hidden bg-muted aspect-video flex items-center justify-center">
                    <img
                      src={url}
                      alt={`Slider input ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                        className="rounded-full shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                      {url}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
