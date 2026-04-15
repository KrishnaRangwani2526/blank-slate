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
import { toast } from "sonner";
import { Brain, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SkillsPage = () => {
  const { user } = useAuth();
  const { skills, refetch } = useProfile();
  const { extractSkills, isLoading, result, reset } = useSkillExtractor();
  const [content, setContent] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const handleExtract = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content to analyze");
      return;
    }
    try {
      const res = await extractSkills(content);
      if (res?.skills?.length && user) {
        const skillsToAdd = res.skills.map((s: any) => ({
          user_id: user.id,
          name: s.name,
          category: s.category || "general",
          percentage: s.percentage || 50,
        }));
        await supabase.from("skills").upsert(skillsToAdd, { onConflict: "user_id,name", ignoreDuplicates: false });
        refetch();
      }
    } catch { /* handled by hook */ }
  };

  const addManualSkill = async () => {
    if (!newSkill.trim() || !user) return;
    await supabase.from("skills").insert({ user_id: user.id, name: newSkill.trim() });
    setNewSkill("");
    refetch();
    toast.success("Skill added");
  };

  const deleteSkill = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
    refetch();
    toast.success("Skill removed");
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
            <h1 className="text-2xl font-bold text-foreground">Skill Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your skills and extract new ones using AI</p>
          </div>
        </div>

        {/* Current Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Skills ({skills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet. Add manually or extract from content below.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="gap-1 pr-1">
                    {skill.name}
                    <button onClick={() => deleteSkill(skill.id)} className="ml-1 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => e.key === "Enter" && addManualSkill()}
              />
              <Button onClick={addManualSkill} size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Skill Extractor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Skill Extractor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste a certificate description, project README, or any technical content to extract skills automatically.
            </p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste content here... (e.g. project description, certificate name, GitHub bio)"
              rows={4}
            />
            <Button onClick={handleExtract} disabled={isLoading} className="gap-2">
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
