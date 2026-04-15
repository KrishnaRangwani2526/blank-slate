// API client - uses Supabase edge functions instead of localhost

import { supabase } from "@/integrations/supabase/client";

export interface JobRankRequest {
  job_id: string;
  required_skills: string[];
}

export interface JobRankResponse {
  candidates: Array<{
    id: string;
    name: string;
    rank: number;
    ats_score: number;
    skills: string[];
    platforms: {
      github?: string;
      leetcode?: string;
      kaggle?: string;
    };
  }>;
}

export interface ProfileAnalysisRequest {
  github_url?: string;
  leetcode_url?: string;
  kaggle_url?: string;
}

export interface ProfileAnalysisResponse {
  github_streak: number;
  leetcode_solved: number;
  kaggle_competitions: number;
  total_score: number;
}

export const rankingApi = {
  rankJob: async (request: JobRankRequest): Promise<JobRankResponse> => {
    // First get the job to extract skills from requirements
    const { data: job } = await supabase
      .from("jobs")
      .select("requirements")
      .eq("id", request.job_id)
      .maybeSingle();

    const requiredSkills = request.required_skills.length > 0
      ? request.required_skills
      : (Array.isArray(job?.requirements)
          ? (job.requirements as any[]).map((r: any) => (typeof r === "string" ? r : r?.name || "")).filter(Boolean)
          : []);

    const { data: applications } = await supabase
      .from("applications")
      .select("*")
      .eq("job_id", request.job_id);

    if (!applications || applications.length === 0) {
      return { candidates: [] };
    }

    const userIds = applications.map(a => a.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    const { data: allSkills } = await supabase
      .from("skills")
      .select("*")
      .in("user_id", userIds);

    const candidates = (profiles || []).map((profile) => {
      const userSkills = (allSkills || []).filter(s => s.user_id === profile.user_id);
      const skillNames = userSkills.map(s => s.name);
      const matchedSkills = skillNames.filter(s =>
        requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
      );
      const atsScore = requiredSkills.length > 0
        ? (matchedSkills.length / requiredSkills.length) * 100
        : 50;

      return {
        id: profile.user_id,
        name: profile.full_name || profile.display_name || "Unknown",
        rank: 0,
        ats_score: Math.round(atsScore * 10) / 10,
        skills: skillNames,
        platforms: {
          github: profile.github_url || undefined,
          leetcode: profile.leetcode_url || undefined,
          kaggle: profile.kaggle_url || undefined,
        },
      };
    });

    candidates.sort((a, b) => b.ats_score - a.ats_score);
    candidates.forEach((c, i) => { c.rank = i + 1; });

    return { candidates };
  },
};

export const streakApi = {
  analyzeProfile: async (request: ProfileAnalysisRequest): Promise<ProfileAnalysisResponse> => {
    // Return demo data
    return {
      github_streak: request.github_url ? Math.floor(Math.random() * 30) + 5 : 0,
      leetcode_solved: request.leetcode_url ? Math.floor(Math.random() * 200) + 50 : 0,
      kaggle_competitions: request.kaggle_url ? Math.floor(Math.random() * 10) + 1 : 0,
      total_score: Math.floor(Math.random() * 40) + 60,
    };
  },
};
