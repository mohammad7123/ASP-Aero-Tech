import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetAdminSettings, useUpdateAdminSettings, getGetAdminSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Globe, Phone, Palette, MessageSquare, Share2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const urlSchema = z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional();
const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color").or(z.literal("")).nullable().optional();

const settingsSchema = z.object({
  siteName: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  logoUrl: urlSchema,
  faviconUrl: urlSchema,
  
  contactEmail: z.string().email("Must be a valid email").or(z.literal("")).nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactPhone2: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  whatsappGreeting: z.string().nullable().optional(),
  
  linkedinUrl: urlSchema,
  twitterUrl: urlSchema,
  facebookUrl: urlSchema,
  instagramUrl: urlSchema,
  youtubeUrl: urlSchema,
  
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  theme: z.string().nullable().optional(),
  backgroundColor: hexColorSchema,
  fontFamily: z.string().nullable().optional(),
  
  chatbotEnabled: z.boolean().nullable().optional(),
  chatbotName: z.string().nullable().optional(),
  chatbotGreeting: z.string().nullable().optional(),
  
  bannerHeight: z.coerce.number().min(0).max(1000).nullable().optional(),
  bannerSpeed: z.coerce.number().min(0).max(60000).nullable().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const [activeTab, setActiveTab] = useState("identity");

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {},
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (settings && !initializedRef.current) {
      form.reset({
        ...settings,
        chatbotEnabled: settings.chatbotEnabled ?? false,
      });
      initializedRef.current = true;
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings.mutate(
      { data },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetAdminSettingsQueryKey(), updated);
          toast({
            title: "Settings saved",
            description: "System configuration updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Transmission failed",
            description: "Could not save settings. Please verify inputs and try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "identity", label: "Identity", icon: Globe },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social Links", icon: Share2 },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "chatbot", label: "Chatbot", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global application parameters and public presentation.</p>
        </div>
        <button
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors clip-edges disabled:opacity-50"
        >
          {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all text-left whitespace-nowrap ${
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-card border border-border p-6 sm:p-8 clip-edges min-h-[500px]">
          <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {activeTab === "identity" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-bold">Brand Identity</h2>
                  <p className="text-sm text-muted-foreground">Core identification strings and assets.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Site Name</label>
                    <input {...form.register("siteName")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Tagline</label>
                    <input {...form.register("tagline")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Description</label>
                  <textarea {...form.register("description")} rows={3} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Logo URL</label>
                    <input {...form.register("logoUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Favicon URL</label>
                    <input {...form.register("faviconUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-bold">Contact Points</h2>
                  <p className="text-sm text-muted-foreground">Public communication channels.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Primary Email</label>
                    <input {...form.register("contactEmail")} type="email" className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Primary Phone</label>
                    <input {...form.register("contactPhone")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Secondary Phone</label>
                    <input {...form.register("contactPhone2")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">WhatsApp Number</label>
                    <input {...form.register("whatsappNumber")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Physical Address</label>
                  <textarea {...form.register("address")} rows={2} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm resize-none" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">WhatsApp Greeting</label>
                  <input {...form.register("whatsappGreeting")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-bold">Social Networks</h2>
                  <p className="text-sm text-muted-foreground">External presence links.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">LinkedIn</label>
                    <input {...form.register("linkedinUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Twitter / X</label>
                    <input {...form.register("twitterUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Facebook</label>
                    <input {...form.register("facebookUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Instagram</label>
                    <input {...form.register("instagramUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">YouTube</label>
                    <input {...form.register("youtubeUrl")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-bold">Visual Language</h2>
                  <p className="text-sm text-muted-foreground">Colors and stylistic properties. Use Hex codes (e.g. #F47E20).</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Primary Color</label>
                    <div className="flex gap-2">
                      <input type="color" {...form.register("primaryColor")} className="h-10 w-12 bg-background border border-border p-1" />
                      <input {...form.register("primaryColor")} className="flex-1 w-full bg-background border border-border px-4 py-2 focus:outline-none focus:border-primary transition-colors text-sm uppercase" />
                    </div>
                    {form.formState.errors.primaryColor && <p className="text-xs text-red-500">{form.formState.errors.primaryColor.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Secondary Color</label>
                    <div className="flex gap-2">
                      <input type="color" {...form.register("secondaryColor")} className="h-10 w-12 bg-background border border-border p-1" />
                      <input {...form.register("secondaryColor")} className="flex-1 w-full bg-background border border-border px-4 py-2 focus:outline-none focus:border-primary transition-colors text-sm uppercase" />
                    </div>
                    {form.formState.errors.secondaryColor && <p className="text-xs text-red-500">{form.formState.errors.secondaryColor.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Accent Color</label>
                    <div className="flex gap-2">
                      <input type="color" {...form.register("accentColor")} className="h-10 w-12 bg-background border border-border p-1" />
                      <input {...form.register("accentColor")} className="flex-1 w-full bg-background border border-border px-4 py-2 focus:outline-none focus:border-primary transition-colors text-sm uppercase" />
                    </div>
                    {form.formState.errors.accentColor && <p className="text-xs text-red-500">{form.formState.errors.accentColor.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Background Color</label>
                    <input {...form.register("backgroundColor")} placeholder="#FFFFFF" className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                    {form.formState.errors.backgroundColor && <p className="text-xs text-red-500">{form.formState.errors.backgroundColor.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Theme Name</label>
                    <select {...form.register("theme")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm appearance-none">
                      <option value="">Default (Auto)</option>
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Font Family</label>
                    <input {...form.register("fontFamily")} placeholder="'Inter', sans-serif" className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-6">
                  <h3 className="text-sm font-bold text-foreground">Layout Dimensions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Banner Height (px)</label>
                      <input type="number" {...form.register("bannerHeight")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Banner Speed (ms)</label>
                      <input type="number" {...form.register("bannerSpeed")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chatbot" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-bold">Interactive Agent</h2>
                  <p className="text-sm text-muted-foreground">Configure the automated assistance module on the public site.</p>
                </div>
                
                <div className="flex items-center gap-3 p-4 border border-primary/20 bg-primary/5 rounded-lg mb-6">
                  <input type="checkbox" id="chatbotEnabled" {...form.register("chatbotEnabled")} className="w-5 h-5 accent-primary" />
                  <label htmlFor="chatbotEnabled" className="text-sm font-bold cursor-pointer">Activate Interactive Agent</label>
                </div>

                <div className="grid grid-cols-1 gap-6 opacity-100 transition-opacity">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Agent Name</label>
                    <input {...form.register("chatbotName")} placeholder="e.g. ASP Support Bot" className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Initial Greeting</label>
                    <textarea {...form.register("chatbotGreeting")} rows={3} placeholder="Hello. How can I assist you with your mission requirements today?" className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors text-sm resize-none" />
                  </div>
                </div>
                
                <div className="mt-4 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded text-sm text-yellow-600/90 dark:text-yellow-400 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Enabling the agent reveals a floating contact widget on the public website. Responses are currently automated with fallback contact forms if live chat is unavailable.</p>
                </div>
              </div>
            )}
            
          </form>
        </div>
      </div>
    </div>
  );
}