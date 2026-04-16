import { supabase } from "@/integrations/supabase/client";

/**
 * Generate JSON structured output using Lovable AI Gateway.
 */
export async function generateJSONWithGemini(prompt: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: { prompt, mode: "json" },
  });

  if (error) {
    console.error("AI generate error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Generate text/markdown using Lovable AI Gateway.
 */
export async function generateTextWithGemini(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: { prompt, mode: "text" },
  });

  if (error) {
    console.error("AI generate error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.text || "";
}
