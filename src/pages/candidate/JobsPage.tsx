// @ts-nocheck
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const JobsPage = () => {
  const { user } = useAuth();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myApplications = [], refetch: refetchApps } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("job_id")
        .eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const appliedJobIds = useMemo(
    () => new Set(myApplications.map((a) => a.job_id)),
    [myApplications]
  );

  const newJobs = useMemo(
    () => jobs.filter((job: any) => new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)),
    [jobs]
  );

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error("Sign in before applying for jobs.");
      return;
    }
    if (appliedJobIds.has(jobId)) {
      toast.info("You've already applied for this job.");
      return;
    }

    try {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        user_id: user.id,
        status: "applied",
      });

      if (error) throw error;
      toast.success("Application submitted successfully!");
      refetchApps();
    } catch (err: any) {
      toast.error(err.message || "Unable to apply right now.");
    }
  };

  const extractSkills = (requirements: any): string[] => {
    if (!requirements) return [];
    if (Array.isArray(requirements)) {
      return requirements
        .map((r: any) => (typeof r === "string" ? r : r?.name || ""))
        .filter(Boolean);
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Jobs</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Browse and apply for active job openings.
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border p-6 animate-pulse">
                <div className="h-5 w-48 bg-secondary rounded mb-3" />
                <div className="h-3 w-32 bg-secondary rounded mb-2" />
                <div className="h-3 w-64 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {newJobs.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary mb-4">
                {newJobs.length} new job posting{newJobs.length > 1 ? "s" : ""} published in the last 24 hours.
              </div>
            )}
            {error ? (
              <Card>
                <CardContent className="p-6 text-sm text-destructive">Unable to load jobs: {(error as Error).message}</CardContent>
              </Card>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No active job postings found. Check back later!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job: any) => {
                  const isApplied = appliedJobIds.has(job.id);
                  const jobSkills = extractSkills(job.requirements);
                  return (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <p className="text-xl font-semibold text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{job.location || "Remote"} · {job.work_mode} · {job.job_type}</p>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description || "No description available."}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleApply(job.id)}
                              disabled={isApplied}
                              variant={isApplied ? "secondary" : "default"}
                            >
                              {isApplied ? "✓ Applied" : "Apply"}
                            </Button>
                          </div>
                        </div>
                        {jobSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {jobSkills.map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
