import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  github: {
    today_commits: number;
    weekly_commits: number;
    active_days: number;
    streak: number;
  };
  leetcode: {
    today_solved: number;
    weekly_solved: number;
    streak: number;
  };
  kaggle: {
    weekly_activity: number;
    last_active_days_ago: number | null;
    note: string;
  };
}

export const useStreakData = () => {
  return useQuery({
    queryKey: ["streak-data"],
    queryFn: async (): Promise<StreakData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("github_url, leetcode_url, kaggle_url")
        .eq("user_id", user.id)
        .single();

      // Return demo data - in production this would call a streak-extractor edge function
      return {
        github: {
          today_commits: profile?.github_url ? Math.floor(Math.random() * 5) + 1 : 0,
          weekly_commits: profile?.github_url ? Math.floor(Math.random() * 20) + 5 : 0,
          active_days: profile?.github_url ? Math.floor(Math.random() * 5) + 2 : 0,
          streak: profile?.github_url ? Math.floor(Math.random() * 15) + 3 : 0,
        },
        leetcode: {
          today_solved: profile?.leetcode_url ? Math.floor(Math.random() * 3) + 1 : 0,
          weekly_solved: profile?.leetcode_url ? Math.floor(Math.random() * 10) + 3 : 0,
          streak: profile?.leetcode_url ? Math.floor(Math.random() * 10) + 2 : 0,
        },
        kaggle: {
          weekly_activity: profile?.kaggle_url ? Math.floor(Math.random() * 5) : 0,
          last_active_days_ago: profile?.kaggle_url ? Math.floor(Math.random() * 7) : null,
          note: profile?.kaggle_url ? "Active competitor" : "No Kaggle profile linked",
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
