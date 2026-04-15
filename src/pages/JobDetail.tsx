import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Clock, Monitor } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!job) return <DashboardLayout><p>Job not found</p></DashboardLayout>;

  const requirements = (job.required_skills || []) as string[];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/jobs")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || "Remote"}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 capitalize" /> {job.type || "Full-time"}</span>
            </div>
          </div>
          <Badge variant={job.status === "open" ? "default" : "secondary"} className="capitalize">{job.status}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-heading">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{job.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-heading">Required Skills</CardTitle></CardHeader>
              <CardContent>
                {requirements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills specified.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {requirements.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-heading text-lg">Applications ({applications.length})</CardTitle></CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app: any) => (
                      <div key={app.id} className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Applicant</p>
                          <p className="text-xs text-muted-foreground capitalize">{app.status}</p>
                        </div>
                        {app.rank && <span className="text-xs font-mono">#{app.rank}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-heading text-lg">Platform Requirements</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-sm text-muted-foreground">Platform requirements not configured.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
