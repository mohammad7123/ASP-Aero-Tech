import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminSettingsQueryKey,
  useGetAdminSettings,
  useUpdateAdminSettings,
} from "@workspace/api-client-react";
import {
  AlertCircle, BarChart3, Bot, BrainCircuit, Download, FileCode2, Globe, Loader2, Mail,
  MessageCircle, Palette, Phone, Save, Share2, Smartphone,
} from "lucide-react";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const nullableText = z.string().nullable().optional();
const nullableUrl = z.string().url("Enter a valid URL").or(z.literal("")).nullable().optional();
const color = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Enter a valid hex color").or(z.literal("")).nullable().optional();

const schema = z.object({
  siteName: nullableText, tagline: nullableText, description: nullableText, siteUrl: nullableUrl, logoUrl: nullableUrl, faviconUrl: nullableUrl,
  contactEmail: z.string().email("Enter a valid email").or(z.literal("")).nullable().optional(),
  contactPhone: nullableText, contactPhone2: nullableText, address: nullableText,
  whatsappNumber: nullableText, whatsappGreeting: nullableText,
  linkedinUrl: nullableUrl, twitterUrl: nullableUrl, facebookUrl: nullableUrl, instagramUrl: nullableUrl, youtubeUrl: nullableUrl,
  primaryColor: color, secondaryColor: color, accentColor: color, backgroundColor: color,
  theme: nullableText, fontFamily: nullableText,
  bannerHeight: z.coerce.number().min(300).max(1000).nullable().optional(),
  bannerSpeed: z.coerce.number().min(1).max(60).nullable().optional(),
  smtpHost: nullableText, smtpPort: z.coerce.number().min(1).max(65535).nullable().optional(),
  smtpUsername: nullableText, smtpPassword: nullableText, smtpPasswordSet: z.boolean().nullable().optional(), smtpFromAddress: nullableText,
  smsProvider: nullableText, smsApiKey: nullableText, smsApiKeySet: z.boolean().nullable().optional(), smsSenderId: nullableText,
  whatsappProvider: nullableText, whatsappApiKey: nullableText, whatsappApiKeySet: z.boolean().nullable().optional(),
  aiProvider: nullableText, aiApiKey: nullableText, aiApiKeySet: z.boolean().nullable().optional(), aiModel: nullableText, aiBaseUrl: nullableUrl,
  analyticsId: z.string().regex(/^G-[A-Z0-9]+$/, "Use a valid GA4 Measurement ID such as G-ABC123").or(z.literal("")).nullable().optional(),
  chatbotEnabled: z.boolean().nullable().optional(), chatbotName: nullableText, chatbotGreeting: nullableText, chatbotModel: nullableText,
});

type Values = z.infer<typeof schema>;
type Tab = "general" | "appearance" | "contact" | "social" | "smtp" | "sms" | "whatsapp" | "ai" | "analytics" | "seo" | "chatbot";

const inputClass = "w-full rounded border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-primary/5";

function Field({ label, registration, type = "text", placeholder, help, error }: {
  label: string;
  registration: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
  help?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      <input {...registration} type={type} placeholder={placeholder} className={inputClass} />
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SecretNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetAdminSettings();
  const update = useUpdateAdminSettings();
  const [tab, setTab] = useState<Tab>("general");
  const initialized = useRef(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { chatbotEnabled: false } });

  useEffect(() => {
    if (data && !initialized.current) {
      form.reset({ ...data, chatbotEnabled: data.chatbotEnabled ?? false });
      initialized.current = true;
    }
  }, [data, form]);

  const save = (values: Values) => {
    update.mutate({ data: values }, {
      onSuccess: (saved) => {
        queryClient.setQueryData(getGetAdminSettingsQueryKey(), saved);
        form.reset({ ...saved, chatbotEnabled: saved.chatbotEnabled ?? false });
        toast({ title: "Settings saved", description: "The website configuration is now active." });
      },
      onError: (error) => toast({
        title: "Could not save settings",
        description: error instanceof Error ? error.message : "Check the values and try again.",
        variant: "destructive",
      }),
    });
  };

  const tabs: Array<{ id: Tab; label: string; icon: typeof Globe }> = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Colors & Fonts", icon: Palette },
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "smtp", label: "SMTP", icon: Mail },
    { id: "sms", label: "SMS", icon: Smartphone },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "ai", label: "AI Providers", icon: BrainCircuit },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "seo", label: "SEO Files", icon: FileCode2 },
    { id: "chatbot", label: "Chatbot", icon: Bot },
  ];

  const downloadSeoFile = (kind: "sitemap" | "robots") => {
    const parsed = schema.shape.siteUrl.safeParse(form.getValues("siteUrl"));
    if (!parsed.success || !parsed.data) {
      form.setError("siteUrl", { message: "Enter and save the public website URL first" });
      setTab("seo");
      return;
    }
    const base = parsed.data.replace(/\/$/, "");
    const routes = ["", "/about", "/services", "/products", "/industries", "/blog", "/careers", "/contact", "/privacy-policy"];
    const content = kind === "sitemap"
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${base}${route || "/"}</loc></url>`).join("\n")}\n</urlset>\n`
      : `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: kind === "sitemap" ? "application/xml" : "text/plain" }));
    link.download = kind === "sitemap" ? "sitemap.xml" : "robots.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const errors = form.formState.errors;
  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure public presentation, communication providers, analytics, and AI.</p>
        </div>
        <button onClick={form.handleSubmit(save)} disabled={update.isPending} className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity disabled:opacity-50">
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[210px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`flex items-center gap-3 whitespace-nowrap rounded px-4 py-3 text-left text-sm font-semibold transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        <form onSubmit={form.handleSubmit(save)} className="min-h-[520px] rounded border border-border bg-card p-6 sm:p-8">
          {tab === "general" && <Section title="General" description="Brand identity and website assets.">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Site Name" registration={form.register("siteName")} />
              <Field label="Tagline" registration={form.register("tagline")} />
              <Field label="Public Site URL" registration={form.register("siteUrl")} placeholder="https://www.example.com" error={errors.siteUrl?.message} />
              <Field label="Logo URL" registration={form.register("logoUrl")} error={errors.logoUrl?.message} />
              <Field label="Favicon URL" registration={form.register("faviconUrl")} error={errors.faviconUrl?.message} />
            </div>
            <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Description</label><textarea {...form.register("description")} rows={4} className={inputClass} /></div>
          </Section>}

          {tab === "appearance" && <Section title="Colors & Fonts" description="Changes apply to the public website after saving.">
            <div className="grid gap-6 sm:grid-cols-2">
              {(["primaryColor", "secondaryColor", "accentColor", "backgroundColor"] as const).map((name) => <Field key={name} label={name.replace(/([A-Z])/g, " $1")} registration={form.register(name)} placeholder="#0B203D" error={errors[name]?.message} />)}
              <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Theme</label><select {...form.register("theme")} className={inputClass}><option value="">Default</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
              <Field label="Font Family" registration={form.register("fontFamily")} placeholder="Inter, sans-serif" />
              <Field label="Banner Height (px)" registration={form.register("bannerHeight")} type="number" error={errors.bannerHeight?.message} />
              <Field label="Carousel Speed (seconds)" registration={form.register("bannerSpeed")} type="number" error={errors.bannerSpeed?.message} />
            </div>
          </Section>}

          {tab === "contact" && <Section title="Contact Information" description="Public contact details displayed throughout the website.">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Email" registration={form.register("contactEmail")} type="email" error={errors.contactEmail?.message} />
              <Field label="Primary Phone" registration={form.register("contactPhone")} />
              <Field label="Secondary Phone" registration={form.register("contactPhone2")} />
            </div>
            <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Address</label><textarea {...form.register("address")} rows={3} className={inputClass} /></div>
          </Section>}

          {tab === "social" && <Section title="Social Media" description="Public profile links used in the website footer.">
            <div className="grid gap-6 sm:grid-cols-2">
              {(["linkedinUrl", "twitterUrl", "facebookUrl", "instagramUrl", "youtubeUrl"] as const).map((name) => <Field key={name} label={name.replace("Url", "").replace(/([A-Z])/g, " $1")} registration={form.register(name)} placeholder="https://" error={errors[name]?.message} />)}
            </div>
          </Section>}

          {tab === "smtp" && <Section title="SMTP Email Configuration" description="Used for transactional email and future email campaign delivery.">
            <SecretNotice>SMTP passwords are encrypted before storage. The masked value means a password is already configured.</SecretNotice>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="SMTP Host" registration={form.register("smtpHost")} placeholder="smtp.office365.com" />
              <Field label="SMTP Port" registration={form.register("smtpPort")} type="number" placeholder="587" error={errors.smtpPort?.message} />
              <Field label="SMTP Username" registration={form.register("smtpUsername")} />
              <Field label="SMTP Password" registration={form.register("smtpPassword")} type="password" placeholder={data?.smtpPasswordSet ? "••••••••" : "Enter password"} />
              <Field label="From Address" registration={form.register("smtpFromAddress")} type="email" />
            </div>
          </Section>}

          {tab === "sms" && <Section title="SMS Configuration" description="Provider settings for consented SMS recipients.">
            <SecretNotice>Authentication tokens are encrypted before storage and never exposed through the public API.</SecretNotice>
            <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Provider</label><select {...form.register("smsProvider")} className={inputClass}><option value="">Select provider</option><option value="twilio">Twilio</option><option value="msg91">MSG91</option><option value="textlocal">Textlocal</option></select></div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="API Key / Auth Token" registration={form.register("smsApiKey")} type="password" placeholder={data?.smsApiKeySet ? "••••••••" : "Enter token"} />
              <Field label="Sender ID / From Number" registration={form.register("smsSenderId")} placeholder="ASPTECH or +91..." />
            </div>
          </Section>}

          {tab === "whatsapp" && <Section title="WhatsApp" description="Configure the floating public widget and optional bulk provider.">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="WhatsApp Number" registration={form.register("whatsappNumber")} help="Include country code without a plus sign." />
              <Field label="Greeting Message" registration={form.register("whatsappGreeting")} />
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 text-sm font-bold">Bulk Sending Provider</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Provider</label><select {...form.register("whatsappProvider")} className={inputClass}><option value="">Click-through link only</option><option value="meta">Meta WhatsApp Business</option><option value="twilio">Twilio WhatsApp</option></select></div>
                <Field label="Provider API Token" registration={form.register("whatsappApiKey")} type="password" placeholder={data?.whatsappApiKeySet ? "••••••••" : "Enter token"} />
              </div>
            </div>
          </Section>}

          {tab === "ai" && <Section title="AI Providers" description="Configure the provider used by AI Studio and the public chatbot.">
            <SecretNotice>API keys are encrypted at rest. Leave the masked value unchanged to keep the current key. The existing server-side OpenAI secret is used when no OpenAI key is entered here.</SecretNotice>
            <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Provider</label><select {...form.register("aiProvider")} className={inputClass}><option value="openai">OpenAI</option><option value="openrouter">OpenRouter</option><option value="anthropic">Anthropic</option><option value="gemini">Google Gemini</option></select></div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="API Key" registration={form.register("aiApiKey")} type="password" placeholder={data?.aiApiKeySet ? "••••••••" : "Enter provider key"} />
              <Field label="Default Model" registration={form.register("aiModel")} placeholder="gpt-5-mini" />
              <Field label="Base URL" registration={form.register("aiBaseUrl")} placeholder="https://api.openai.com/v1" error={errors.aiBaseUrl?.message} />
            </div>
          </Section>}

          {tab === "analytics" && <Section title="Analytics" description="Google Analytics loads only after a visitor grants analytics-cookie consent.">
            <Field label="Google Analytics ID (GA4)" registration={form.register("analyticsId")} placeholder="G-XXXXXXXXXX" help="Leave blank to disable analytics." error={errors.analyticsId?.message} />
          </Section>}

          {tab === "seo" && <Section title="SEO Files" description="Generate standard search-engine files for upload to the public website root.">
            <Field label="Public Site URL" registration={form.register("siteUrl")} placeholder="https://www.example.com" help="This URL is used for every sitemap entry and the robots sitemap reference." error={errors.siteUrl?.message} />
            <div className="grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => downloadSeoFile("sitemap")} className="flex items-center justify-center gap-2 rounded border border-border bg-background px-4 py-4 text-sm font-bold hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> Generate sitemap.xml</button>
              <button type="button" onClick={() => downloadSeoFile("robots")} className="flex items-center justify-center gap-2 rounded border border-border bg-background px-4 py-4 text-sm font-bold hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> Generate robots.txt</button>
            </div>
            <p className="text-xs text-muted-foreground">Upload both downloaded files to the root of the published domain so they are available at /sitemap.xml and /robots.txt.</p>
          </Section>}

          {tab === "chatbot" && <Section title="AI Chatbot" description="Configure the intelligent assistant shown on the public website.">
            <div className="flex items-center gap-3 rounded border border-primary/20 bg-primary/5 p-4"><input id="chatbotEnabled" type="checkbox" {...form.register("chatbotEnabled")} className="h-5 w-5 accent-primary" /><label htmlFor="chatbotEnabled" className="cursor-pointer text-sm font-bold">Enable Chatbot</label></div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Bot Name" registration={form.register("chatbotName")} placeholder="ASP Aero Tech Assistant" />
              <Field label="AI Model Override" registration={form.register("chatbotModel")} placeholder="Leave blank to use provider default" />
            </div>
            <div className="space-y-2"><label className="text-xs font-mono uppercase text-muted-foreground">Greeting Message</label><textarea {...form.register("chatbotGreeting")} rows={3} className={inputClass} /></div>
            <p className="text-xs text-muted-foreground">The chatbot uses the selected AI provider above. Configure its key there, or use the existing server-side OpenAI integration.</p>
          </Section>}
        </form>
      </div>
    </div>
  );
}