// @ts-nocheck
import { useState, forwardRef, useImperativeHandle } from "react";
import { Plus, Award, Pencil, Brain, ExternalLink, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  certificates: Tables<"certificates">[];
  refetch: () => void;
}

const CertificateSection = forwardRef<{ openAdd: () => void }, Props>(({ certificates, refetch }, ref) => {
  const { user } = useAuth();
  const { extractSkills, isLoading: extractingSkills } = useSkillExtractor();
  useImperativeHandle(ref, () => ({ openAdd: () => { resetForm(); setAdding(true); } }));
  const [editing, setEditing] = useState<Tables<"certificates"> | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [extractingCert, setExtractingCert] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const resetForm = () => { setTitle(""); setIssuer(""); setIssueDate(""); setDescription(""); setCredentialUrl(""); };
  const openAdd = () => { resetForm(); setAdding(true); };
  const openEdit = (c: Tables<"certificates">) => {
    setTitle(c.name); setIssuer(c.issuer || ""); setIssueDate(c.issue_date || "");
    setCredentialUrl(c.credential_url || ""); setDescription(""); setEditing(c);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const data = { name: title, issuer, issue_date: issueDate || null, credential_url: credentialUrl || null, user_id: user.id };
    if (editing) {
      await supabase.from("certificates").update(data).eq("id", editing.id);
      setEditing(null);
    } else {
      const { data: newCert } = await supabase.from("certificates").insert(data).select().single();
      if (newCert) setJustAdded(newCert.id);
      setAdding(false);
    }
    setSaving(false);
    refetch();
  };

  const del = async (id: string) => {
    setSaving(true);
    await supabase.from("certificates").delete().eq("id", id);
    setSaving(false);
    setEditing(null);
    refetch();
  };

  const handleExtractSkills = async (cert: Tables<"certificates">) => {
    setExtractingCert(cert.id);
    try {
      const content = `${cert.name} ${cert.issuer || ""}`.trim();
      if (!content) throw new Error("Certificate has no content to analyze");
      const result = await extractSkills(content);
      if (result?.skills?.length && user) {
        const skillsToAdd = result.skills.map(skill => ({ user_id: user.id, name: skill.name, category: skill.category || null }));
        await supabase.from("skills").upsert(skillsToAdd, { onConflict: "user_id,name", ignoreDuplicates: false });
        refetch();
        toast.success(`Added ${result.skills.length} skills from certificate`);
      }
      setJustAdded(null);
    } catch (error) {
      console.error("Skill extraction failed:", error);
    } finally {
      setExtractingCert(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Licenses & Certifications</h2>
          {user && (
            <button onClick={openAdd} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Add Certificate Form */}
        {adding && (
          <form onSubmit={save} className="mb-4 p-4 rounded-lg border bg-secondary/30 space-y-3 animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground">Add Certificate</h3>
            <input className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Certificate Title *" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[60px]" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <input className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Issuer" value={issuer} onChange={e => setIssuer(e.target.value)} />
            <input type="date" className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            <input className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Credential URL" value={credentialUrl} onChange={e => setCredentialUrl(e.target.value)} />
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                {saving ? "Saving..." : "Add Certificate"}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-secondary">Cancel</button>
            </div>
          </form>
        )}

        {certificates.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground italic">No certificates added yet.</p>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-rank-bg flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-rank-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-card-foreground">{cert.name}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {user?.id === cert.user_id && (
                        <button onClick={() => openEdit(cert)} className="p-1 rounded-md hover:bg-secondary transition-all">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  {cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
                  {cert.issue_date && <p className="text-xs text-muted-foreground">Issued {cert.issue_date}</p>}
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                      <ExternalLink className="h-3 w-3" /> View Credential
                    </a>
                  )}
                  {/* Add Skill button - always visible */}
                  <button
                    onClick={() => handleExtractSkills(cert)}
                    disabled={extractingCert === cert.id}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-secondary transition-all disabled:opacity-50"
                  >
                    <Brain className={`h-3.5 w-3.5 ${extractingCert === cert.id ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                    {extractingCert === cert.id ? "Extracting..." : "Add Skill"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit Certificate</h3>
            <form onSubmit={save} className="space-y-3">
              <input className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} required />
              <input className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Issuer" value={issuer} onChange={e => setIssuer(e.target.value)} />
              <input type="date" className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
              <input className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Credential URL" value={credentialUrl} onChange={e => setCredentialUrl(e.target.value)} />
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Save</button>
                <button type="button" onClick={() => del(editing.id)} disabled={saving} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm">Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
});

export default CertificateSection;
