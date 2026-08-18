import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  system: z.string().default("You are a helpful assistant."),
  prompt: z.string().min(1),
});

export const askAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "AI is not configured yet. Please add the AI key." };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash",
        messages: [
          { role: "system", content: data.system },
          { role: "user", content: data.prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429)
        return { ok: false as const, error: "Too many requests right now — try again shortly." };
      if (res.status === 402)
        return { ok: false as const, error: "AI credits are exhausted. Please top up to continue." };
      return { ok: false as const, error: `AI request failed (${res.status}): ${text.slice(0, 200)}` };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) return { ok: false as const, error: "The AI returned an empty response." };
    return { ok: true as const, content };
  });
