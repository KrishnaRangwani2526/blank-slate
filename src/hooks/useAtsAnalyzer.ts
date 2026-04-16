// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface ATSResult {
  ats_score: number;
  summary: string;
  profile_summary: {
    bio: string;
    top_skills: string[];
    current_projects: Array<{ name: string; description: string; tech: string[] }>;
    certifications: { has_certs: boolean; list: string[]; summary: string };
    experience_highlights: string[];
  };
  score_breakdown: Array<{ category: string; score: number; max: number; detail: string }>;
  profile_gaps: Array<{ area: string; severity: "high" | "medium" | "low"; detail: string }>;
  strengths: string[];
  weaknesses: string[];
  consistency_score: number;
  recommendations: string[];
  learning_roadmap: string[];
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  gap_analysis?: string;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const normalizeText = (value?: string | null) => (typeof value === "string" ? value.trim() : "");

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(String(item))).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,|/]+/)
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return [];
};

const uniqueStrings = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();

  return values.filter((value): value is string => {
    const normalized = normalizeText(value);
    if (!normalized) return false;

    const key = normalized.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const wordCount = (value?: string | null) => normalizeText(value).split(/\s+/).filter(Boolean).length;

const scoreByThresholds = (count: number, thresholds: number[], scores: number[]) => {
  for (let index = thresholds.length - 1; index >= 0; index -= 1) {
    if (count >= thresholds[index]) return scores[index];
  }

  return scores[0];
};

const extractRequirementSkills = (jobRequirements?: string) => {
  if (!jobRequirements) return [];

  return uniqueStrings(
    jobRequirements
      .split(/[\n,•;]+/)
      .flatMap((part) => part.split(/\band\b/gi))
      .map((part) => part.replace(/[^a-zA-Z0-9+#./ -]/g, " "))
      .map((part) => normalizeText(part))
      .filter((part) => part.length >= 2)
  );
};

const mergeAtsResults = (fallbackResult: ATSResult, generatedResult?: Partial<ATSResult> | null): ATSResult => {
  if (!generatedResult || typeof generatedResult !== "object") {
    return fallbackResult;
  }

  const generatedProfileSummary = generatedResult.profile_summary || {};
  const generatedCertifications = generatedProfileSummary.certifications || {};

  return {
    ...fallbackResult,
    ...generatedResult,
    profile_summary: {
      ...fallbackResult.profile_summary,
      ...generatedProfileSummary,
      top_skills:
        Array.isArray(generatedProfileSummary.top_skills) && generatedProfileSummary.top_skills.length > 0
          ? generatedProfileSummary.top_skills
          : fallbackResult.profile_summary.top_skills,
      current_projects:
        Array.isArray(generatedProfileSummary.current_projects) && generatedProfileSummary.current_projects.length > 0
          ? generatedProfileSummary.current_projects
          : fallbackResult.profile_summary.current_projects,
      certifications: {
        ...fallbackResult.profile_summary.certifications,
        ...generatedCertifications,
        list:
          Array.isArray(generatedCertifications.list) && generatedCertifications.list.length > 0
            ? generatedCertifications.list
            : fallbackResult.profile_summary.certifications.list,
      },
      experience_highlights:
        Array.isArray(generatedProfileSummary.experience_highlights) && generatedProfileSummary.experience_highlights.length > 0
          ? generatedProfileSummary.experience_highlights
          : fallbackResult.profile_summary.experience_highlights,
    },
    score_breakdown:
      Array.isArray(generatedResult.score_breakdown) && generatedResult.score_breakdown.length > 0
        ? generatedResult.score_breakdown
        : fallbackResult.score_breakdown,
    profile_gaps:
      Array.isArray(generatedResult.profile_gaps) && generatedResult.profile_gaps.length > 0
        ? generatedResult.profile_gaps
        : fallbackResult.profile_gaps,
    strengths:
      Array.isArray(generatedResult.strengths) && generatedResult.strengths.length > 0
        ? generatedResult.strengths
        : fallbackResult.strengths,
    weaknesses:
      Array.isArray(generatedResult.weaknesses) && generatedResult.weaknesses.length > 0
        ? generatedResult.weaknesses
        : fallbackResult.weaknesses,
    recommendations:
      Array.isArray(generatedResult.recommendations) && generatedResult.recommendations.length > 0
        ? generatedResult.recommendations
        : fallbackResult.recommendations,
    learning_roadmap:
      Array.isArray(generatedResult.learning_roadmap) && generatedResult.learning_roadmap.length > 0
        ? generatedResult.learning_roadmap
        : fallbackResult.learning_roadmap,
    matched_skills:
      Array.isArray(generatedResult.matched_skills) ? generatedResult.matched_skills : fallbackResult.matched_skills,
    missing_skills:
      Array.isArray(generatedResult.missing_skills) ? generatedResult.missing_skills : fallbackResult.missing_skills,
  };
};

const buildLocalATSResult = ({
  profileContext,
  certificates,
  jobRequirements,
}: {
  profileContext: {
    bio: string;
    skills: string[];
    experience: Array<{ role?: string; company?: string; description?: string }>;
    projects: Array<{ title?: string; description?: string; tech?: string[] | string }>;
    education: Array<{ degree?: string; field?: string }>;
  };
  certificates: Array<{ name?: string; issuer?: string }>;
  jobRequirements?: string;
}): ATSResult => {
  const projectSkills = profileContext.projects.flatMap((project) => toStringArray(project.tech));
  const allSkills = uniqueStrings([...profileContext.skills, ...projectSkills]);
  const bioWords = wordCount(profileContext.bio);
  const experienceCount = profileContext.experience.length;
  const projectCount = profileContext.projects.length;
  const educationCount = profileContext.education.length;
  const certificateCount = certificates.length;
  const projectDepth = profileContext.projects.filter((project) => wordCount(project.description) >= 8).length;
  const detailedExperienceCount = profileContext.experience.filter((item) => wordCount(item.description) >= 8).length;

  const profileFoundationScore = clamp(
    (bioWords > 0 ? Math.min(40, bioWords * 1.6) : 0) +
      (educationCount > 0 ? 20 : 0) +
      (certificateCount > 0 ? 15 : 0) +
      Math.min(25, projectCount * 8)
  );

  const skillsScore = clamp(
    scoreByThresholds(allSkills.length, [0, 1, 3, 6, 10], [18, 38, 58, 78, 92]) +
      Math.min(8, projectSkills.length)
  );

  const experienceScore = clamp(
    scoreByThresholds(experienceCount, [0, 1, 2, 3], [20, 50, 72, 86]) +
      Math.min(12, detailedExperienceCount * 6)
  );

  const projectScore = clamp(
    scoreByThresholds(projectCount, [0, 1, 2, 4], [15, 48, 72, 88]) +
      Math.min(12, projectDepth * 6)
  );

  const consistencyScore = clamp(
    [bioWords > 0, allSkills.length > 0, experienceCount > 0, projectCount > 0, educationCount > 0, certificateCount > 0].filter(Boolean)
      .length * 16.5
  );

  const requiredSkills = extractRequirementSkills(jobRequirements);
  const normalizedSkillSet = new Set(allSkills.map((skill) => skill.toLowerCase()));
  const matchedSkills = requiredSkills.filter((skill) => normalizedSkillSet.has(skill.toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !normalizedSkillSet.has(skill.toLowerCase()));
  const matchPercentage = requiredSkills.length
    ? clamp((matchedSkills.length / requiredSkills.length) * 100)
    : undefined;

  const weightedBaseScore =
    profileFoundationScore * 0.25 +
    skillsScore * 0.3 +
    experienceScore * 0.2 +
    projectScore * 0.25;

  const atsScore = clamp(
    matchPercentage === undefined ? weightedBaseScore : weightedBaseScore * 0.75 + matchPercentage * 0.25
  );

  const strengths = uniqueStrings([
    bioWords >= 20 ? "Profile includes a meaningful professional summary" : undefined,
    allSkills.length >= 5 ? `Solid visible skill coverage across ${allSkills.length} areas` : undefined,
    projectCount > 0 ? `${projectCount} project${projectCount > 1 ? "s" : ""} help demonstrate hands-on work` : undefined,
    experienceCount > 0 ? "Work experience section gives recruiters more context" : undefined,
    certificateCount > 0 ? "Certificates strengthen credibility and keyword coverage" : undefined,
  ]).slice(0, 4);

  const profileGaps = [
    !bioWords
      ? { area: "Profile summary", severity: "high", detail: "Add a concise bio so ATS systems and recruiters can understand your target role quickly." }
      : null,
    allSkills.length < 5
      ? { area: "Skills coverage", severity: allSkills.length === 0 ? "high" : "medium", detail: "Add more relevant technical skills to improve keyword matching in ATS scans." }
      : null,
    projectCount === 0
      ? { area: "Projects", severity: "high", detail: "Add at least one detailed project with technologies and impact." }
      : null,
    experienceCount === 0
      ? { area: "Experience", severity: "medium", detail: "Add internships, freelance work, or practical experience to strengthen your profile." }
      : null,
    certificateCount === 0
      ? { area: "Certificates", severity: "low", detail: "Certificates are optional, but they can improve trust and keyword density for specific roles." }
      : null,
  ].filter(Boolean) as ATSResult["profile_gaps"];

  const recommendations = uniqueStrings([
    allSkills.length < 8 ? "Add more role-specific skills and tools to your skills section." : undefined,
    projectDepth < projectCount ? "Rewrite project descriptions to include impact, scope, and tech decisions." : undefined,
    detailedExperienceCount < experienceCount ? "Make experience bullets more specific with outcomes and responsibilities." : undefined,
    !bioWords ? "Write a 2-3 line summary highlighting your focus area and strengths." : undefined,
    certificateCount === 0 ? "Upload relevant certificates if you have them to improve credibility." : undefined,
  ]).slice(0, 5);

  const weaknesses = profileGaps.map((gap) => gap.detail).slice(0, 4);

  const learningRoadmap = [
    recommendations[0] ? `Week 1: ${recommendations[0]}` : "Week 1: Review your profile for missing ATS keywords.",
    recommendations[1] ? `Week 2: ${recommendations[1]}` : "Week 2: Improve one project and one experience entry with measurable outcomes.",
    recommendations[2] ? `Week 3: ${recommendations[2]}` : "Week 3: Add a new proof point such as a certificate, project, or portfolio item.",
  ];

  const certificateNames = uniqueStrings(
    certificates.map((certificate) => normalizeText(certificate.name || certificate.issuer || "Certificate"))
  );

  const experienceHighlights = profileContext.experience
    .map((item) => uniqueStrings([item.role, item.company]).join(" at "))
    .filter(Boolean)
    .slice(0, 3);

  return {
    ats_score: atsScore,
    summary:
      atsScore >= 75
        ? "Your profile already covers the basics well and should pass many ATS checks, but stronger detail can still improve rankings."
        : atsScore >= 50
          ? "Your profile has a reasonable foundation, but adding clearer keywords, stronger descriptions, and more proof points would improve ATS performance."
          : "Your profile needs more role-specific content before it will perform well in ATS screening.",
    profile_summary: {
      bio: profileContext.bio || "No profile summary added yet.",
      top_skills: allSkills.slice(0, 8),
      current_projects: profileContext.projects.map((project) => ({
        name: project.title || "Untitled project",
        description: project.description || "No project description added yet.",
        tech: toStringArray(project.tech),
      })),
      certifications: {
        has_certs: certificateCount > 0,
        list: certificateNames,
        summary:
          certificateCount > 0
            ? `${certificateCount} certificate${certificateCount > 1 ? "s" : ""} added to the profile.`
            : "No certificates added yet.",
      },
      experience_highlights:
        experienceHighlights.length > 0 ? experienceHighlights : ["Add experience entries to improve recruiter trust and ATS relevance."],
    },
    score_breakdown: [
      {
        category: "Profile Foundation",
        score: profileFoundationScore,
        max: 100,
        detail: "Measures summary quality, education, certificates, and overall completeness.",
      },
      {
        category: "Skills Relevance",
        score: skillsScore,
        max: 100,
        detail: "Looks at the breadth of visible technical skills and keywords across your profile.",
      },
      {
        category: "Project Depth & Impact",
        score: projectScore,
        max: 100,
        detail: "Rewards projects with clear descriptions, technologies, and evidence of execution.",
      },
      {
        category: "Work Experience",
        score: experienceScore,
        max: 100,
        detail: "Evaluates whether your experience section provides enough real-world proof of ability.",
      },
    ],
    profile_gaps: profileGaps,
    strengths:
      strengths.length > 0 ? strengths : ["Start by adding a summary, skills, and at least one project to improve ATS visibility."],
    weaknesses,
    consistency_score: consistencyScore,
    recommendations,
    learning_roadmap: learningRoadmap,
    match_percentage: matchPercentage,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    gap_analysis:
      matchPercentage === undefined
        ? undefined
        : matchPercentage >= 70
          ? "Your current profile already aligns well with the provided job requirements."
          : "Your profile only partially matches the provided requirements, so adding the missing skills should improve fit.",
  };
};

export function useAtsAnalyzer() {
  const { user } = useAuth();
  const { profile, skills, experience, projects, education, certificates } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeProfile = async (jobRequirements?: string) => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return null;
    }

    setLoading(true);
    try {
      const profileContext = {
        bio: profile.bio || profile.about,
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({ role: e.role, company: e.company, description: e.description })),
        projects: projects.map((p) => ({ title: p.title, description: p.description, tech: p.tech_stack })),
        education: education.map((e) => ({ degree: e.degree, field: e.field_of_study })),
        certificates: certificates.map((c) => ({ name: c.name, issuer: c.issuer })),
      };

      const fallbackResult = buildLocalATSResult({
        profileContext,
        certificates: profileContext.certificates,
        jobRequirements,
      });

      const prompt = `You are an expert AI Resume and ATS Analyzer. Your task is to analyze the following candidate profile strictly.

Candidate Profile JSON:
${JSON.stringify(profileContext, null, 2)}

${jobRequirements ? `Job Requirements to match against:\n${jobRequirements}\n\n` : ''}
    
Provide a detailed JSON response exactly matching this schema:
{
  "ats_score": number (0-100),
  "summary": "overall summary",
  "profile_summary": {
    "bio": "string",
    "top_skills": ["skill1", ...],
    "current_projects": [{"name": "string", "description": "string", "tech": ["string"]}],
    "certifications": {"has_certs": boolean, "list": ["string"], "summary": "string"},
    "experience_highlights": ["string"]
  },
  "score_breakdown": [
    {"category": "Skills Quality & Relevance", "score": number, "max": 100, "detail": "string"},
    {"category": "Project Depth & Impact", "score": number, "max": 100, "detail": "string"},
    {"category": "Work Experience", "score": number, "max": 100, "detail": "string"}
  ],
  "profile_gaps": [{"area": "string", "severity": "high" | "medium" | "low", "detail": "string"}],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "consistency_score": number (0-100),
  "recommendations": ["actionable advice 1", ...],
  "learning_roadmap": ["week 1 plan", ...]
  ${jobRequirements ? `, "match_percentage": number, "matched_skills": ["string"], "missing_skills": ["string"], "gap_analysis": "string"` : ''}
}
Limit score_breakdown categories to 3-5 critical areas. Make the response highly customized to the candidate's actual data. If the profile is largely empty, reflect that with a low score and basic advice. DO NOT INCLUDE MARKDOWN FORMATTING (like \`\`\`json) IN YOUR RESPONSE, JUST THE RAW JSON OBJECT.`;

      let generatedResult = null;
      let usedFallback = false;

      try {
        const { generateJSONWithGemini } = await import("@/lib/gemini");
        generatedResult = await generateJSONWithGemini(prompt);
      } catch (aiError) {
        usedFallback = true;
        console.warn("ATS AI analysis unavailable, using local fallback:", aiError);
      }

      const completeResult: ATSResult = mergeAtsResults(fallbackResult, generatedResult);

      setResult(completeResult);

      if (usedFallback) {
        toast.info("AI analysis is temporarily unavailable, so a local ATS score was generated.");
      }

      return completeResult;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to analyze profile with AI");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeProfile, result, loading };
}
