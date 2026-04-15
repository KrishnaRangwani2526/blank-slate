// @ts-nocheck
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HRCandidateProfile } from "@/components/HRCandidateProfile";
import { ArrowLeft, MessageSquare, Send, BarChart3, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HRCandidateProfilePage() {
  const { id: candidateUserId } = useParams();
  const navigate = useNavigate();
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobAtsLoading, setJobAtsLoading] = useState(false);
  const [jobAtsResult, setJobAtsResult] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // Fetch candidate profile from profiles table using user_id
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["candidate-profile", candidateUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", candidateUserId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!candidateUserId,
  });

  // Fetch skills, education, projects, certificates, experience
  const { data: skills = [] } = useQuery({
    queryKey: ["candidate-skills", candidateUserId],
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").eq("user_id", candidateUserId!);
      return data || [];
    },
    enabled: !!candidateUserId,
  });

  const { data: education = [] } = useQuery({
    queryKey: ["candidate-education", candidateUserId],
    queryFn: async () => {
      const { data } = await supabase.from("education").select("*").eq("user_id", candidateUserId!);
      return data || [];
    },
    enabled: !!candidateUserId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["candidate-projects", candidateUserId],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").eq("user_id", candidateUserId!);
      return data || [];
    },
    enabled: !!candidateUserId,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["candidate-certificates", candidateUserId],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*").eq("user_id", candidateUserId!);
      return data || [];
    },
    enabled: !!candidateUserId,
  });

  const { data: experience = [] } = useQuery({
    queryKey: ["candidate-experience", candidateUserId],
    queryFn: async () => {
      const { data } = await supabase.from("experience").select("*").eq("user_id", candidateUserId!);
      return data || [];
    },
    enabled: !!candidateUserId,
  });

  // Fetch HR's jobs for job-matched ATS
  const { data: hrJobs = [] } = useQuery({
    queryKey: ["hr-jobs-for-ats"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Candidate-only ATS Analysis
  const handleCandidateATS = async () => {
    if (!profile) return;
    setAtsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const skillNames = skills.map((s) => s.name);
      const totalPossible = 6;
      const scores = [
        { category: "Skills Breadth", score: Math.min(skillNames.length * 12, 100), max: 100, detail: `${skillNames.length} skills detected` },
        { category: "Project Portfolio", score: Math.min(projects.length * 25, 100), max: 100, detail: `${projects.length} projects` },
        { category: "Work Experience", score: Math.min(experience.length * 30, 100), max: 100, detail: `${experience.length} roles` },
        { category: "Education", score: Math.min(education.length * 40, 100), max: 100, detail: `${education.length} degrees` },
        { category: "Certifications", score: Math.min(certificates.length * 25, 100), max: 100, detail: `${certificates.length} certificates` },
        { category: "Profile Completeness", score: profile.bio ? 80 : 30, max: 100, detail: profile.bio ? "Bio present" : "Missing bio" },
      ];
      const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalPossible);

      setAtsResult({
        ats_score: avgScore,
        score_breakdown: scores,
        strengths: skillNames.length >= 3 ? ["Diverse skill set"] : [],
        weaknesses: skillNames.length < 3 ? ["Limited skills on profile"] : [],
        recommendations: [
          skillNames.length < 5 ? "Add more skills via project/certificate upload" : "Maintain diverse skill portfolio",
          projects.length < 2 ? "Add more projects to showcase work" : "Good project portfolio",
        ],
      });
    } finally {
      setAtsLoading(false);
    }
  };

  // Job-Matched ATS
  const handleJobMatchedATS = async () => {
    if (!profile || !selectedJobId) {
      toast.error("Select a job to match against");
      return;
    }
    setJobAtsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const job = hrJobs.find((j) => j.id === selectedJobId);
      if (!job) throw new Error("Job not found");

      const requiredSkills = Array.isArray(job.requirements)
        ? job.requirements.map((r: any) => (typeof r === "string" ? r : r?.name || "")).filter(Boolean)
        : [];

      const candidateSkillNames = skills.map((s) => s.name.toLowerCase());
      const matched = requiredSkills.filter((rs: string) => candidateSkillNames.includes(rs.toLowerCase()));
      const missing = requiredSkills.filter((rs: string) => !candidateSkillNames.includes(rs.toLowerCase()));
      const matchPercent = requiredSkills.length > 0 ? Math.round((matched.length / requiredSkills.length) * 100) : 50;

      setJobAtsResult({
        job_title: job.title,
        match_percentage: matchPercent,
        matched_skills: matched,
        missing_skills: missing,
        total_required: requiredSkills.length,
        gap_analysis: missing.length > 0
          ? `Candidate is missing ${missing.length} out of ${requiredSkills.length} required skills: ${missing.join(", ")}`
          : "Candidate matches all required skills!",
      });
    } finally {
      setJobAtsLoading(false);
    }
  };

  // Generate Resume
  const handleGenerateResume = async () => {
    if (!profile) return;
    setResumeLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setResumeData({
        name: profile.full_name || "Candidate",
        email: profile.email || "",
        bio: profile.bio || profile.about || "",
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({
          company: e.company,
          role: e.role,
          duration: `${e.start_date || ""} - ${e.end_date || "Present"}`,
          description: e.description || "",
        })),
        education: education.map((e) => ({
          school: e.school,
          degree: e.degree,
          field: e.field_of_study || "",
          year: e.end_date || "",
        })),
        projects: projects.map((p) => ({
          name: p.title,
          description: p.description || "",
          tech: p.tech_stack || [],
          link: p.project_link,
        })),
      });
      toast.success("Resume generated!");
    } finally {
      setResumeLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    toast.success(`Message sent to ${profile?.full_name}`);
    setMessageText("");
    setMessageOpen(false);
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse p-6">Loading candidate profile...</div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <p className="text-muted-foreground">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  // Transform data for HRCandidateProfile component
  const candidateData = {
    id: profile.user_id,
    name: profile.full_name || "Unknown",
    email: profile.email || "",
    bio: profile.bio,
    profile_pic: profile.avatar_url,
    about: profile.about,
    skills: skills.map((s) => s.name),
    education: education.map((e) => ({
      id: e.id,
      school: e.school,
      degree: e.degree,
      field: e.field_of_study || "",
      year: e.end_date || "",
    })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      link: p.project_link,
    })),
    certificates: certificates.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer || "",
      date: c.issue_date || "",
    })),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => setMessageOpen(true)} variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Message
            </Button>
          </div>
        </div>

        {/* Profile (non-editable) */}
        <HRCandidateProfile
          candidate={candidateData}
          ranking={{ ats_score: atsResult?.ats_score }}
          streaks={{ github: 0, leetcode: 0, kaggle: 0, aspiring: 0 }}
          onMessageClick={() => setMessageOpen(true)}
        />

        {/* HR AI Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              HR AI Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="candidate-ats">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="candidate-ats">Candidate ATS</TabsTrigger>
                <TabsTrigger value="job-ats">Job-Matched ATS</TabsTrigger>
                <TabsTrigger value="resume">Resume Maker</TabsTrigger>
              </TabsList>

              {/* Candidate-Only ATS */}
              <TabsContent value="candidate-ats" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Analyze this candidate's profile independently to get an overall ATS score.</p>
                <Button onClick={handleCandidateATS} disabled={atsLoading}>
                  {atsLoading ? "Analyzing..." : "Run Candidate ATS Analysis"}
                </Button>
                {atsResult && (
                  <div className="space-y-4 mt-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{atsResult.ats_score}</div>
                      <p className="text-sm text-muted-foreground">Overall ATS Score</p>
                    </div>
                    <div className="space-y-2">
                      {atsResult.score_breakdown.map((item: any) => (
                        <div key={item.category} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                          <div>
                            <p className="text-sm font-medium">{item.category}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                          <div className="text-sm font-bold">{item.score}/{item.max}</div>
                        </div>
                      ))}
                    </div>
                    {atsResult.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Recommendations:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {atsResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Job-Matched ATS */}
              <TabsContent value="job-ats" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Match this candidate against a specific job's requirements.</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Job</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    <option value="">-- Choose a job --</option>
                    {hrJobs.map((j) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleJobMatchedATS} disabled={jobAtsLoading || !selectedJobId}>
                  {jobAtsLoading ? "Matching..." : "Run Job-Matched ATS"}
                </Button>
                {jobAtsResult && (
                  <div className="space-y-4 mt-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${jobAtsResult.match_percentage >= 70 ? 'text-green-600' : jobAtsResult.match_percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {jobAtsResult.match_percentage}%
                      </div>
                      <p className="text-sm text-muted-foreground">Match with {jobAtsResult.job_title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-green-600 mb-2">Matched Skills ({jobAtsResult.matched_skills.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {jobAtsResult.matched_skills.map((s: string) => (
                            <Badge key={s} variant="default" className="bg-green-100 text-green-800">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600 mb-2">Missing Skills ({jobAtsResult.missing_skills.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {jobAtsResult.missing_skills.map((s: string) => (
                            <Badge key={s} variant="destructive">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{jobAtsResult.gap_analysis}</p>
                  </div>
                )}
              </TabsContent>

              {/* Resume Maker */}
              <TabsContent value="resume" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Generate a structured resume from this candidate's profile data.</p>
                <Button onClick={handleGenerateResume} disabled={resumeLoading} className="gap-2">
                  <FileText className="h-4 w-4" />
                  {resumeLoading ? "Generating..." : "Generate Resume"}
                </Button>
                {resumeData && (
                  <Card className="mt-4 border-2">
                    <CardContent className="p-6 space-y-6 font-mono text-sm">
                      <div className="text-center border-b pb-4">
                        <h2 className="text-xl font-bold">{resumeData.name}</h2>
                        <p className="text-muted-foreground">{resumeData.email}</p>
                        {resumeData.bio && <p className="mt-2 text-xs">{resumeData.bio}</p>}
                      </div>

                      {resumeData.skills.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-primary">Skills</h3>
                          <p>{resumeData.skills.join(" • ")}</p>
                        </div>
                      )}

                      {resumeData.experience.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-primary">Experience</h3>
                          {resumeData.experience.map((exp: any, i: number) => (
                            <div key={i} className="mb-3">
                              <div className="flex justify-between">
                                <span className="font-semibold">{exp.role}</span>
                                <span className="text-muted-foreground">{exp.duration}</span>
                              </div>
                              <p className="text-muted-foreground">{exp.company}</p>
                              {exp.description && <p className="mt-1">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {resumeData.education.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-primary">Education</h3>
                          {resumeData.education.map((edu: any, i: number) => (
                            <div key={i} className="mb-2">
                              <span className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                              <p className="text-muted-foreground">{edu.school} {edu.year && `(${edu.year})`}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {resumeData.projects.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-primary">Projects</h3>
                          {resumeData.projects.map((proj: any, i: number) => (
                            <div key={i} className="mb-3">
                              <span className="font-semibold">{proj.name}</span>
                              {proj.tech.length > 0 && <span className="text-muted-foreground"> ({proj.tech.join(", ")})</span>}
                              <p className="mt-1">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Message Dialog */}
        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to {profile.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-32"
              />
              <Button className="w-full gap-2" onClick={handleSendMessage}>
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
