import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  useGetMarketingOverview, 
  useGetMarketingReports,
  useListCampaigns, 
  useCreateCampaign, 
  useUpdateCampaign, 
  useDeleteCampaign, 
  usePrepareCampaignRecipients, 
  useGenerateMarketingCopy,
  useGetPublicSettings,
  Campaign,
  CampaignInputType,
  CampaignPatchStatus,
  getGetMarketingOverviewQueryKey,
  getGetMarketingReportsQueryKey,
  getListCampaignsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, Plus, Megaphone, Users, Target, Mail, MessageSquare, 
  Smartphone, BarChart, PenTool, Edit2, Trash2, Send, Clock, Sparkles, Activity, FileText, CheckCircle, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["email", "sms", "whatsapp"] as const),
  subject: z.string().optional(),
  body: z.string().min(1, "Message body is required"),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export function AdminMarketing() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Marketing Hub</h1>
          <p className="text-muted-foreground mt-1">Orchestrate communications, analyze audience data, and leverage AI copy generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 border-border">
          {[
            { id: "overview", label: "Overview", icon: BarChart },
            { id: "campaigns", label: "Campaigns", icon: Megaphone },
            { id: "reports", label: "Reports", icon: Activity },
            { id: "ai-studio", label: "AI Studio", icon: Sparkles },
            { id: "audience", label: "Audience Data", icon: Users },
            { id: "seo", label: "SEO Guidance", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all text-left whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === "overview" && <MarketingOverview />}
          {activeTab === "campaigns" && <CampaignsManager />}
          {activeTab === "reports" && <ReportsManager />}
          {activeTab === "ai-studio" && <AiStudio />}
          {activeTab === "audience" && <AudienceManager />}
          {activeTab === "seo" && <SeoGuidance />}
        </div>
      </div>
    </div>
  );
}

function MarketingOverview() {
  const { data: overview, isLoading } = useGetMarketingOverview();

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: "Total Campaigns", value: (overview as any)?.campaignsTotal || 0, icon: Megaphone },
    { label: "Drafts", value: (overview as any)?.draftCampaigns || 0, icon: Edit2 },
    { label: "Scheduled", value: (overview as any)?.scheduledCampaigns || 0, icon: Clock },
    { label: "Total Contacts", value: (overview as any)?.contactsTotal || 0, icon: Users },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-5 clip-edges shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full transition-transform group-hover:scale-150" />
            <stat.icon className="w-5 h-5 text-primary mb-3 relative z-10" />
            <div className="text-2xl font-display font-black text-foreground relative z-10">{stat.value}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1 relative z-10">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsManager() {
  const { data: reports, isLoading } = useGetMarketingReports();

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const data = reports as {
    campaigns?: Array<{ type?: string; status?: string; count?: number | string }>;
    recipients?: Array<{ status?: string; count?: number | string }>;
    usageEvents?: Array<{ channel?: string; status?: string; count?: number | string }>;
    deliveryProviderConfigured?: boolean;
  } | undefined;
  const campaignRows = data?.campaigns ?? [];
  const recipientRows = data?.recipients ?? [];
  const usageRows = data?.usageEvents ?? [];
  const total = (rows: Array<{ count?: number | string }>) =>
    rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);
  const isConfigured = data?.deliveryProviderConfigured === true;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-card border border-border p-6 clip-edges">
        <h3 className="text-lg font-bold font-display mb-4">Delivery Diagnostics</h3>
        <div className="flex items-center gap-3 p-4 mb-6 border bg-background">
          {isConfigured ? (
            <><CheckCircle className="text-green-500 w-5 h-5" /><span className="text-sm font-medium">Delivery provider is configured and active.</span></>
          ) : (
            <><AlertTriangle className="text-yellow-500 w-5 h-5" /><span className="text-sm font-medium">Delivery provider not configured. Messages will not be dispatched.</span></>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border p-4 bg-background">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Campaigns</div>
            <div className="text-3xl font-black">{total(campaignRows)}</div>
          </div>
          <div className="border border-border p-4 bg-background">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Recipients Processed</div>
            <div className="text-3xl font-black">{total(recipientRows)}</div>
          </div>
          <div className="border border-border p-4 bg-background">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Usage Events</div>
            <div className="text-3xl font-black">{total(usageRows)}</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            { title: "Campaign status", rows: campaignRows, label: (row: Record<string, unknown>) => `${row.type ?? "unknown"} · ${row.status ?? "unknown"}` },
            { title: "Recipient status", rows: recipientRows, label: (row: Record<string, unknown>) => String(row.status ?? "unknown") },
            { title: "Usage events", rows: usageRows, label: (row: Record<string, unknown>) => `${row.channel ?? "unknown"} · ${row.status ?? "unknown"}` },
          ].map((group) => (
            <div key={group.title} className="border border-border bg-background p-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">{group.title}</h4>
              <div className="mt-3 space-y-2">
                {group.rows.length ? group.rows.map((row, index) => (
                  <div key={`${group.title}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="capitalize">{group.label(row)}</span>
                    <strong>{Number(row.count ?? 0)}</strong>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudienceManager() {
  const { data: overview, isLoading } = useGetMarketingOverview();

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const total = (overview as any)?.contactsTotal || 0;
  const marketable = (overview as any)?.marketableContacts || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-card border border-border p-6 clip-edges">
        <h3 className="text-lg font-bold font-display mb-4">Audience Readiness</h3>
        <p className="text-sm text-muted-foreground mb-6">Overview of all tracked contacts and their marketing consent status.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border p-6 bg-background flex flex-col items-center justify-center text-center">
            <Users className="w-8 h-8 text-primary mb-3" />
            <div className="text-4xl font-black mb-1">{total}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Total Contacts</div>
          </div>
          <div className="border border-border p-6 bg-background flex flex-col items-center justify-center text-center">
            <Target className="w-8 h-8 text-green-500 mb-3" />
            <div className="text-4xl font-black mb-1">{marketable}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Marketable Contacts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeoGuidance() {
  const { data: settings, isLoading } = useGetPublicSettings();

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const hasName = !!settings?.siteName;
  const hasDesc = !!settings?.description;
  const hasLogo = !!settings?.logoUrl;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-card border border-border p-6 clip-edges">
        <h3 className="text-lg font-bold font-display mb-4">SEO & Public Identity</h3>
        <p className="text-sm text-muted-foreground mb-6">Guidance based on your current public settings configuration.</p>
        
        <div className="space-y-4">
          <div className={`p-4 border ${hasName ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'} flex items-start gap-3`}>
            {hasName ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />}
            <div>
              <h4 className="font-bold text-sm">Site Name</h4>
              <p className="text-sm mt-1">{hasName ? "Site name is configured, helping search engines identify your brand." : "Site name is missing. Add it in System Settings to improve brand visibility."}</p>
            </div>
          </div>
          
          <div className={`p-4 border ${hasDesc ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'} flex items-start gap-3`}>
            {hasDesc ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />}
            <div>
              <h4 className="font-bold text-sm">Meta Description</h4>
              <p className="text-sm mt-1">{hasDesc ? "Description is present for search result snippets." : "Description is missing. Add a description in System Settings to provide search snippets."}</p>
            </div>
          </div>

          <div className={`p-4 border ${hasLogo ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'} flex items-start gap-3`}>
            {hasLogo ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />}
            <div>
              <h4 className="font-bold text-sm">Logo Asset</h4>
              <p className="text-sm mt-1">{hasLogo ? "Logo URL is provided for social sharing cards." : "Logo URL is missing. Add it to ensure proper branding when pages are shared."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: campaigns, isLoading } = useListCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const prepareCampaign = usePrepareCampaignRecipients();

  const [isCreating, setIsCreating] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      type: "email",
    },
  });

  const onSubmit = (data: CampaignFormValues) => {
    if (editingCampaign) {
      updateCampaign.mutate({
        id: editingCampaign.id,
        data: {
          name: data.name,
          type: data.type,
          subject: data.subject,
          body: data.body,
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
          setEditingCampaign(null);
          toast({ title: "Campaign Updated", description: "Changes persisted to the network." });
        }
      });
    } else {
      createCampaign.mutate({
        data: {
          name: data.name,
          type: data.type,
          subject: data.subject,
          body: data.body,
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
          setIsCreating(false);
          form.reset();
          toast({ title: "Campaign Drafted", description: "New communication sequence initialized." });
        }
      });
    }
  };

  const handlePrepare = (id: number) => {
    prepareCampaign.mutate({ id }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
        toast({ 
          title: "Recipients Prepared", 
          description: `${data.totalRecipients} targets queued. Note: Delivery providers not configured.` 
        });
      }
    });
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (isCreating || editingCampaign) {
    return (
      <div className="bg-card border border-border p-6 clip-edges animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-display">{editingCampaign ? 'Modify Sequence' : 'Initialize Sequence'}</h2>
          <button 
            onClick={() => { setIsCreating(false); setEditingCampaign(null); }}
            className="text-sm font-mono text-muted-foreground hover:text-foreground uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Campaign Name</label>
              <input {...form.register("name")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary text-sm" />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Delivery Vector</label>
              <select {...form.register("type")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary text-sm appearance-none">
                <option value="email">Email Transmission</option>
                <option value="sms">SMS Protocol</option>
                <option value="whatsapp">WhatsApp Secure</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Subject Line (Email Only)</label>
            <input {...form.register("subject")} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Message Payload</label>
            <textarea {...form.register("body")} rows={8} className="w-full bg-background border border-border px-4 py-2.5 focus:outline-none focus:border-primary text-sm resize-y" />
            {form.formState.errors.body && <p className="text-xs text-red-500">{form.formState.errors.body.message}</p>}
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={createCampaign.isPending || updateCampaign.isPending}
              className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-primary/90 clip-edges disabled:opacity-50 flex items-center gap-2"
            >
              {(createCampaign.isPending || updateCampaign.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingCampaign ? 'Save Modifications' : 'Initialize'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-card p-4 border border-border clip-edges">
        <h2 className="text-lg font-bold font-display">Communication Sequences</h2>
        <button 
          onClick={() => { form.reset({ type: "email" }); setIsCreating(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors clip-edges flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Sequence
        </button>
      </div>

      <div className="grid gap-4">
        {campaigns?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border border-dashed clip-edges text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-wider">No active sequences</p>
          </div>
        ) : (
          campaigns?.map((campaign) => (
            <div key={campaign.id} className="bg-card border border-border p-5 clip-edges flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-foreground text-lg">{campaign.name}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                    campaign.status === 'scheduled' ? 'border-primary text-primary bg-primary/10' :
                    campaign.status === 'draft' ? 'border-muted-foreground text-muted-foreground' :
                    'border-green-500 text-green-500 bg-green-500/10'
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase border border-border px-2 py-0.5 bg-white/5">
                    {campaign.type === 'email' && <Mail className="w-3 h-3" />}
                    {campaign.type === 'sms' && <MessageSquare className="w-3 h-3" />}
                    {campaign.type === 'whatsapp' && <Smartphone className="w-3 h-3" />}
                    {campaign.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{campaign.subject || campaign.body}</p>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  Created: {format(new Date(campaign.createdAt), 'PP p')}
                </p>
              </div>
              
              <div className="flex items-center gap-2 self-start md:self-auto">
                {campaign.status === 'draft' && (
                  <button 
                    onClick={() => handlePrepare(campaign.id)}
                    disabled={prepareCampaign.isPending && prepareCampaign.variables?.id === campaign.id}
                    className="p-2 border border-border hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    title="Prepare Recipients"
                  >
                    {(prepareCampaign.isPending && prepareCampaign.variables?.id === campaign.id) ? 
                      <Loader2 className="w-4 h-4 animate-spin" /> : 
                      <Users className="w-4 h-4" />
                    }
                    <span className="hidden xl:inline">Prepare</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setEditingCampaign(campaign);
                    form.reset({
                      name: campaign.name,
                      type: campaign.type,
                      subject: campaign.subject || '',
                      body: campaign.body,
                    });
                  }}
                  className="p-2 border border-border hover:bg-white/10 transition-colors text-muted-foreground"
                  title="Modify"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this sequence?")) {
                      deleteCampaign.mutate({ id: campaign.id }, {
                        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() })
                      });
                    }
                  }}
                  className="p-2 border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors text-muted-foreground"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AiStudio() {
  const { toast } = useToast();
  const generateCopy = useGenerateMarketingCopy();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    generateCopy.mutate({ data: { prompt } }, {
      onSuccess: (data) => {
        setResult(data.copy);
        toast({ title: "Synthesis Complete", description: "AI copy generation finished successfully." });
      },
      onError: () => {
        toast({ title: "Synthesis Failed", description: "The AI core is currently unresponsive.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="bg-card border border-border p-6 clip-edges animate-in fade-in duration-300 h-full flex flex-col">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> AI Synthesis Core
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Generate high-conversion transmission payloads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="space-y-4 flex flex-col">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Mission Parameters</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the objective. e.g. 'Draft an email announcing our new tethered drone system for industrial inspection, focusing on 24-hour continuous flight capability.'"
            className="w-full bg-background border border-border px-4 py-3 focus:outline-none focus:border-primary text-sm flex-1 min-h-[200px] resize-none" 
          />
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || generateCopy.isPending}
            className="w-full bg-primary text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-primary/90 clip-edges disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {generateCopy.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
            Synthesize Payload
          </button>
        </div>

        <div className="space-y-4 flex flex-col h-full">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Generated Payload</label>
          <div className="w-full bg-background border border-border px-4 py-3 text-sm flex-1 min-h-[200px] overflow-auto whitespace-pre-wrap relative">
            {result ? result : (
              <span className="text-muted-foreground/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                Awaiting parameters...
              </span>
            )}
          </div>
          {result && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(result);
                toast({ title: "Copied to Clipboard", description: "Payload ready for deployment." });
              }}
              className="w-full bg-white/5 border border-border px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/10 clip-edges"
            >
              Copy to Clipboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
