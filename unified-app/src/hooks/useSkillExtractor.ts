import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Skill {
  name: string;
  category: "language" | "framework" | "tool" | "database" | "concept";
  percentage: number;
}

interface SkillAnalysisResult {
  detected_type: "certificate" | "project" | "github";
  skills: Skill[];
  summary: string;
  key_concepts: string[];
  complexity_level: "beginner" | "intermediate" | "advanced";
}

export const useSkillExtractor = () => {
  const [result, setResult] = useState<SkillAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractSkills = async (content: string, file?: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let body: Record<string, string> = { content };

      // If a file is provided, convert to base64 and include it
      if (file) {
        const base64 = await fileToBase64(file);
        body.file_base64 = base64;
        body.file_type = file.type;
        body.file_name = file.name;
      }

      const { data, error: fnError } = await supabase.functions.invoke("extract-skills", {
        body,
      });

      if (fnError) {
        if (fnError.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
          throw new Error("Rate limit exceeded");
        }
        if (fnError.message?.includes("402")) {
          toast.error("AI credits exhausted. Please add funds in Settings > Workspace > Usage.");
          throw new Error("Credits exhausted");
        }
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data as SkillAnalysisResult);
      toast.success(`Detected as ${data.detected_type} — ${data.skills.length} skills extracted`);
      return data as SkillAnalysisResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Skill extraction failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    result,
    isLoading,
    error,
    extractSkills,
    reset,
  };
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
