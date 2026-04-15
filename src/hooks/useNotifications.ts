import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CandidateNotification {
  id: string;
  user_id: string;
  created_at: string;
  read: boolean;
  message: string;
  title: string;
  type: string;
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery<CandidateNotification[]>({
    queryKey: ["candidate-notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data ?? []) as CandidateNotification[];
    },
    enabled: Boolean(user?.id)
  });
}
