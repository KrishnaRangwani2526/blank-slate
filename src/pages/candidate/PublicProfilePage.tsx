// @ts-nocheck
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useProfile } from "@/hooks/useProfile";
import { User, MapPin, Briefcase, Award, FolderGit2, GraduationCap, ArrowLeft, Diamond } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { profile, education, experience, projects, certificates, skills, loading } = useProfile(userId);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Profile not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Header */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile.display_name || profile.full_name || "User"}</h1>
              {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.location}</span>}
                {profile.open_to_work && <Badge variant="outline" className="text-[10px]">Open to Work</Badge>}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">ID: {profile.user_id}</p>
            </div>
          </div>
          {profile.about && <p className="text-sm text-muted-foreground mt-4">{profile.about}</p>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Diamond className="h-4 w-4 text-primary" /> Skills ({skills.length})</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>)}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Experience</h2>
            <div className="space-y-3">
              {experience.map(e => (
                <div key={e.id}>
                  <p className="text-sm font-semibold">{e.role}</p>
                  <p className="text-xs text-muted-foreground">{e.company} {e.location ? `· ${e.location}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><FolderGit2 className="h-4 w-4 text-primary" /> Projects</h2>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id}>
                  <p className="text-sm font-semibold">{p.title}</p>
                  {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                  {p.tech_stack?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{p.tech_stack.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Certificates</h2>
            <div className="space-y-3">
              {certificates.map(c => (
                <div key={c.id}>
                  <p className="text-sm font-semibold">{c.name}</p>
                  {c.issuer && <p className="text-xs text-muted-foreground">{c.issuer}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Education</h2>
            <div className="space-y-3">
              {education.map(e => (
                <div key={e.id}>
                  <p className="text-sm font-semibold">{e.degree}</p>
                  <p className="text-xs text-muted-foreground">{e.school} {e.field_of_study ? `· ${e.field_of_study}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
