import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAI } from "./ai.functions";

export function useAI() {
  const call = useServerFn(askAI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(prompt: string, system: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await call({ data: { prompt, system } });
      if (!res.ok) {
        setError(res.error);
        return null;
      }
      return res.content;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { run, loading, error } as const;
}
