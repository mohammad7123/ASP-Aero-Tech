import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { decryptSetting } from "./settings";

const router: IRouter = Router();

function fallbackReply(message: string) {
  const normalized = message.toLowerCase();
  if (/(product|drone|uav|manufacture)/.test(normalized)) {
    return "ASP Aero Tech designs and manufactures mission-configurable unmanned aerial systems in India for surveillance, inspection, mapping, agriculture, emergency response, and other operational needs.";
  }
  if (/(demo|price|quote|buy|purchase)/.test(normalized)) {
    return "Our team can arrange a product briefing, demonstration, or quotation based on your mission and payload requirements. Please use the contact form and select the relevant area of interest.";
  }
  if (/(contact|phone|email|support)/.test(normalized)) {
    return "Please use the website contact form to reach the ASP Aero Tech team. Include your phone number and area of interest so the right specialist can respond.";
  }
  return "I can help with ASP Aero Tech drone products, applications, demonstrations, and support. For detailed specifications or availability, please contact our team through the website form.";
}

function extractResponseText(data: {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}) {
  return data.output_text
    ?? data.output?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n")
    ?? "";
}

async function generateReply(options: {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
}) {
  const { provider, apiKey, baseUrl, model, prompt } = options;
  if (provider === "anthropic") {
    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
    return { response, text: data.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n") ?? "" };
  }
  if (provider === "gemini") {
    const response = await fetch(`${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return { response, text: data.candidates?.flatMap((item) => item.content?.parts ?? []).map((item) => item.text ?? "").join("\n") ?? "" };
  }
  if (provider === "openrouter") {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { response, text: data.choices?.map((item) => item.message?.content ?? "").join("\n") ?? "" };
  }
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: prompt }),
    signal: AbortSignal.timeout(30000),
  });
  return { response, text: extractResponseText(await response.json() as Parameters<typeof extractResponseText>[0]) };
}

router.post("/chatbot/messages", async (req, res): Promise<void> => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 2000) {
    res.status(400).json({ error: "A message up to 2,000 characters is required" });
    return;
  }

  const result = await pool.query<{
    chatbot_enabled: boolean;
    chatbot_name: string | null;
    chatbot_model: string | null;
    ai_provider: string | null;
    ai_api_key_encrypted: string | null;
    ai_model: string | null;
    ai_base_url: string | null;
  }>(`SELECT chatbot_enabled, chatbot_name, chatbot_model, ai_provider, ai_api_key_encrypted, ai_model, ai_base_url
      FROM site_settings ORDER BY id ASC LIMIT 1`);
  const settings = result.rows[0];
  if (!settings?.chatbot_enabled) {
    res.status(503).json({ error: "Chatbot is disabled" });
    return;
  }

  const provider = settings.ai_provider || "openai";
  const configuredKey = settings.ai_api_key_encrypted ? decryptSetting(settings.ai_api_key_encrypted) : null;
  const apiKey = configuredKey || (provider === "openai" ? process.env.OPENAI_API_KEY : null);
  if (!apiKey) {
    res.json({ reply: fallbackReply(message) });
    return;
  }
  const defaults: Record<string, { baseUrl: string; model: string }> = {
    openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-5-mini" },
    openrouter: { baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini" },
    anthropic: { baseUrl: "https://api.anthropic.com/v1", model: "claude-3-5-haiku-latest" },
    gemini: { baseUrl: "https://generativelanguage.googleapis.com/v1beta", model: "gemini-1.5-flash" },
  };
  const providerDefaults = defaults[provider];
  if (!providerDefaults) {
    res.json({ reply: fallbackReply(message) });
    return;
  }
  const baseUrl = (settings.ai_base_url || providerDefaults.baseUrl).replace(/\/$/, "");
  const model = settings.chatbot_model || settings.ai_model || providerDefaults.model;
  const prompt = `You are ${settings.chatbot_name || "ASP Aero Tech Assistant"}, the public website assistant for ASP Aero Tech, an Indian drone and aerospace manufacturer. Answer concisely and accurately about drone products, applications, demonstrations, support, and contacting the company. Never invent specifications, certifications, prices, or availability. If uncertain, ask the visitor to contact the team.\n\nVisitor: ${message}`;

  try {
    const { response, text } = await generateReply({ provider, apiKey, baseUrl, model, prompt });
    if (!response.ok) {
      req.log.error({ provider, status: response.status }, "Chatbot provider request failed");
      res.json({ reply: fallbackReply(message) });
      return;
    }
    const reply = text.trim();
    if (!reply) {
      res.json({ reply: fallbackReply(message) });
      return;
    }
    res.json({ reply });
  } catch (error) {
    req.log.error({ err: error, provider }, "Chatbot request failed");
    res.json({ reply: fallbackReply(message) });
  }
});

export default router;