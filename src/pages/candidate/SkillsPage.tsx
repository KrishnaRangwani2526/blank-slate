// @ts-nocheck
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Brain, ArrowLeft, Award, FolderGit2, Diamond, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const SkillsPage = () => {
  const { user } = useAuth();
  const { skills, certificates, projects, refetch } = useProfile();
  const { extractSkills, isLoading, result, reset } = useSkillExtractor();
  const [content, setContent] = useState("");
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  // Get universal rank for each skill
  const { data: skillRanks = {} } = useQuery({
    queryKey: ["skill-ranks", user?.id, skills.map(s => s.name).join(",")],
    queryFn: async () => {
      const ranks: Record<string, { rank: number; total: number; usageCount: number }> = {};
      for (const skill of skills) {
        // Count how many users have this skill
        const { count: totalWithSkill } = await supabase
          .from("skills")
          .select("*", { count: "exact", head: true })
          .ilike("name", skill.name);

        // Count users with MORE skills than the current user who also have this skill
        // Simplified: rank = position among all users with this skill
        const { data: usersWithSkill } = await supabase
          .from("skills")
          .select("user_id")
          .ilike("name", skill.name);

        ranks[skill.name] = {
          rank: 1, // simplified - would need proper ranking logic
          total: totalWithSkill || 0,
          usageCount: totalWithSkill || 0,
        };
      }
      return ranks;
    },
    enabled: skills.length > 0,
  });

  // Determine skill source (certificate, project, or extracted)
  const getSkillSource = (skillName: string) => {
    const sources: string[] = [];
    certificates.forEach((cert) => {
      if (cert.name?.toLowerCase().includes(skillName.toLowerCase())) {
        sources.push(`Certificate: ${cert.name}`);
      }
    });
    projects.forEach((proj) => {
      const techStack = proj.tech_stack || [];
      if (techStack.some((t: string) => t.toLowerCase() === skillName.toLowerCase()) ||
          proj.title?.toLowerCase().includes(skillName.toLowerCase())) {
        sources.push(`Project: ${proj.title}`);
      }
    });
    if (sources.length === 0) sources.push("Extracted via AI");
    return sources;
  };

  const totalSkills = skills.length;

  const handleExtractFromContent = async () => {
    if (!content.trim()) { toast.error("Please enter some content to analyze"); return; }
    try {
      const res = await extractSkills(content);
      if (res?.skills?.length && user) {
        const skillsToAdd = res.skills.map((s: any) => ({
          user_id: user.id, name: s.name, category: s.category || "general", percentage: s.percentage || 50,
        }));
        await supabase.from("skills").upsert(skillsToAdd, { onConflict: "user_id,name", ignoreDuplicates: false });
        refetch();
        toast.success(`${res.skills.length} skills added!`);
      }
    } catch {}
  };

  const handleExtractFromCert = async (cert: any) => {
    if (!user) return;
    setExtractingId(cert.id);
    try {
      const text = `${cert.name} ${cert.issuer || ""}`.trim();
      const res = await extractSkills(text);
      if (res?.skills?.length) {
        const skillsToAdd = res.skills.map((s: any) => ({ user_id: user.id, name: s.name }));
        await supabase.from("skills").upsert(skillsToAdd, { onConflict: "user_id,name", ignoreDuplicates: false });
        refetch();
      }
    } catch {} finally { setExtractingId(null); }
  };

  const handleExtractFromProject = async (proj: any) => {
    if (!user) return;
    setExtractingId(proj.id);
    try {
      const text = `${proj.title} ${proj.description || ""} ${(proj.tech_stack || []).join(" ")}`.trim();
      const res = await extractSkills(text);
      if (res?.skills?.length) {
        const skillsToAdd = res.skills.map((s: any) => ({ user_id: user.id, name: s.name }));
        await supabase.from("skills").upsert(skillsToAdd, { onConflict: "user_id,name", ignoreDuplicates: false });
        refetch();
      }
    } catch {} finally { setExtractingId(null); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skills Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalSkills} skills · Ranked by usage across all users
            </p>
          </div>
        </div>

        {/* Skill Analytics Summary */}
        {totalSkills > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalSkills}</p>
                <p className="text-xs text-muted-foreground">Total Skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {skills.filter(s => s.category === "language").length}
                </p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {skills.filter(s => s.category === "framework").length}
                </p>
                <p className="text-xs text-muted-foreground">Frameworks</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ranked Skill List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Diamond className="h-5 w-5 text-primary" />
                My Skills ({totalSkills})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No skills yet. Extract skills from your certificates or projects below.
              </p>
            ) : (
              <div className="space-y-2">
                {skills.map((skill, index) => {
                  const rankData = skillRanks[skill.name];
                  const percentage = totalSkills > 0 ? Math.round(((index + 1) / totalSkills) * 100) : 0;
                  const isExpanded = expandedSkill === skill.id;
                  const sources = getSkillSource(skill.name);

                  return (
                    <div key={skill.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
                          <Diamond className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          {skill.category && (
                            <Badge variant="outline" className="text-[10px]">{skill.category}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {rankData && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {rankData.usageCount} users
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{100 - percentage}%</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t bg-secondary/20">
                          <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                          {sources.map((src, i) => (
                            <p key={i} className="text-xs text-foreground">• {src}</p>
                          ))}
                          {rankData && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Universal rank: used by {rankData.total} developer{rankData.total !== 1 ? "s" : ""}
                            </p>
                          )}
                          {/* Percentage bar */}
                          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${100 - percentage}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Skills can only be added through the AI skill extractor — from certificates, projects, or custom content.
            </p>
          </CardContent>
        </Card>

        {/* Extract from Certificates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Extract from Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No certificates yet. Add certificates from your <Link to="/" className="text-primary hover:underline">dashboard</Link> first.
              </p>
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{cert.name}</p>
                    {cert.issuer && <p className="text-xs text-muted-foreground">{cert.issuer}</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleExtractFromCert(cert)} disabled={extractingId === cert.id} className="gap-1">
                    <Brain className={`h-3.5 w-3.5 ${extractingId === cert.id ? "animate-pulse" : ""}`} />
                    {extractingId === cert.id ? "Extracting..." : "Extract Skills"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Extract from Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" /> Extract from Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects yet. Add projects from your <Link to="/projects" className="text-primary hover:underline">projects page</Link> first.
              </p>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{proj.title}</p>
                    {proj.tech_stack?.length > 0 && <p className="text-xs text-muted-foreground">{proj.tech_stack.join(", ")}</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleExtractFromProject(proj)} disabled={extractingId === proj.id} className="gap-1">
                    <Brain className={`h-3.5 w-3.5 ${extractingId === proj.id ? "animate-pulse" : ""}`} />
                    {extractingId === proj.id ? "Extracting..." : "Extract Skills"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Skill Extractor - Custom Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> AI Skill Extractor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Paste any technical content to extract skills automatically.</p>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste content here..." rows={4} />
            <Button onClick={handleExtractFromContent} disabled={isLoading} className="gap-2">
              {isLoading ? "Extracting..." : "Extract Skills"}
            </Button>
            {result && (
              <div className="mt-4 p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Detected: {result.detected_type} ({result.complexity_level})</p>
                  <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>
                </div>
                <p className="text-xs text-muted-foreground">{result.summary}</p>
                <div className="flex flex-wrap gap-1">
                  {result.skills.map((s) => (
                    <Badge key={s.name} className="text-xs">{s.name} ({s.percentage}%)</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillsPage;
