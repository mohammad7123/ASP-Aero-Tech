import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { productCategories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ProductForm = Record<string, any>;

const specFields = [
  ["range", "Range"],
  ["endurance", "Endurance"],
  ["payload", "Payload"],
  ["frameSize", "Frame size"],
  ["span", "Span"],
  ["wingSpan", "Wing span"],
  ["maxSpeed", "Maximum speed"],
  ["altitude", "Altitude"],
  ["agl", "AGL"],
] as const;

export function productImageUrl(path?: string | null) {
  if (!path) return "";
  return path.startsWith("/objects/") ? `/api/storage${path}` : path;
}

export function ProductEditorFields({
  formData,
  setFormData,
}: {
  formData: ProductForm;
  setFormData: (value: ProductForm) => void;
}) {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const categories = Array.isArray(formData.categories) ? formData.categories : [];
  const specs = formData.specs && typeof formData.specs === "object" && !Array.isArray(formData.specs) ? formData.specs : {};
  const features = Array.isArray(formData.features) ? formData.features : [];

  const update = (name: string, value: unknown) => setFormData({ ...formData, [name]: value });

  const toggleCategory = (category: string) => {
    const next = categories.includes(category)
      ? categories.filter((item: string) => item !== category)
      : [...categories, category];
    update("categories", next);
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "IMAGE REQUIRED", description: "Choose a JPG, PNG, or WebP image.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const request = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!request.ok) throw new Error((await request.json().catch(() => null))?.error || "Unable to prepare upload");
      const upload = await request.json() as { uploadURL: string; objectPath: string };
      const put = await fetch(upload.uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("Image upload failed");
      update("image_url", upload.objectPath);
      toast({ title: "IMAGE STORED", description: "The product image is ready to save." });
    } catch (error) {
      toast({ title: "UPLOAD FAILED", description: error instanceof Error ? error.message : "Unable to upload image.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <>
      <Field label="Name" required>
        <Input value={formData.name || ""} onChange={(event) => update("name", event.target.value)} required />
      </Field>
      <Field label="URL slug" required hint="Keep existing slugs unchanged so current links continue to work.">
        <Input value={formData.slug || ""} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required />
      </Field>
      <Field label="Summary" required>
        <textarea className="flex min-h-24 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm" value={formData.short_desc || ""} onChange={(event) => update("short_desc", event.target.value)} required />
      </Field>
      <Field label="Description">
        <textarea className="flex min-h-32 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm" value={formData.description || ""} onChange={(event) => update("description", event.target.value)} />
      </Field>
      <Field label="Product image">
        {formData.image_url && <img src={productImageUrl(formData.image_url)} alt="" className="mb-3 aspect-video w-full rounded border border-border object-cover" />}
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => event.target.files?.[0] && void uploadImage(event.target.files[0])} />
        <Button type="button" variant="outline" className="w-full" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          {uploading ? "UPLOADING..." : "UPLOAD TO APP STORAGE"}
        </Button>
      </Field>
      <Field label="Mission categories" required hint="Select one or more of the ten catalog categories.">
        <div className="grid gap-2 sm:grid-cols-2">
          {productCategories.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-2 rounded border border-border bg-background/50 p-3 text-xs font-medium">
              <input type="checkbox" checked={categories.includes(category)} onChange={() => toggleCategory(category)} />
              {category}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Technical specifications">
        <div className="grid gap-3 sm:grid-cols-2">
          {specFields.map(([key, label]) => (
            <label key={key} className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
              <Input value={specs[key] || ""} onChange={(event) => update("specs", { ...specs, [key]: event.target.value })} />
            </label>
          ))}
        </div>
      </Field>
      <Field label="Features" hint="Enter one feature per line.">
        <textarea
          className="flex min-h-28 w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm"
          value={features.join("\n")}
          onChange={(event) => update("features", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Display order">
          <Input type="number" value={formData.sort_order ?? 0} onChange={(event) => update("sort_order", Number(event.target.value))} />
        </Field>
        <Field label="Published">
          <select className="flex h-10 w-full rounded-sm border border-input bg-background/50 px-3 text-sm" value={formData.is_active === false ? "false" : "true"} onChange={(event) => update("is_active", event.target.value === "true")}>
            <option value="true">PUBLISHED</option>
            <option value="false">DRAFT</option>
          </select>
        </Field>
      </div>
    </>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}