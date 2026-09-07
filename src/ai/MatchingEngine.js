/**
 * CareerPilot AI Matching Engine
 * Implements weighted multi-attribute matching and semantic normalization.
 * Designed with Strategy/Engine pattern for extensibility.
 */
class MatchingEngine {
  constructor() {
    this.weights = {
      requiredSkills: 0.50,
      preferredSkills: 0.15,
      experience: 0.15,
      education: 0.10,
      careerInterests: 0.10
    };

    // Canonical skill alias dictionary to avoid false matches & support real tech terms
    this.aliasMap = {
      'c++': 'cpp',
      'cplusplus': 'cpp',
      'cpp': 'cpp',
      'c#': 'csharp',
      'csharp': 'csharp',
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'react': 'react',
      'reactjs': 'react',
      'react.js': 'react',
      'node': 'nodejs',
      'nodejs': 'nodejs',
      'node.js': 'nodejs',
      'express': 'express',
      'expressjs': 'express',
      'vue': 'vue',
      'vuejs': 'vue',
      'postgres': 'postgresql',
      'postgresql': 'postgresql',
      'mongo': 'mongodb',
      'mongodb': 'mongodb',
      'k8s': 'kubernetes',
      'kubernetes': 'kubernetes',
      'golang': 'go',
      'go': 'go',
      'python': 'python',
      'py': 'python',
      'java': 'java',
      'html': 'html5',
      'html5': 'html5',
      'css': 'css3',
      'css3': 'css3',
      'tailwind': 'tailwindcss',
      'tailwindcss': 'tailwindcss'
    };
  }

  /**
   * Normalizes a string or skill tag for precise comparison (B27)
   */
  normalizeSkill(skill) {
    if (!skill || typeof skill !== 'string') return '';
    const trimmed = skill.toLowerCase().trim();
    if (!trimmed) return '';

    // Direct alias check before symbol stripping
    if (this.aliasMap[trimmed]) return this.aliasMap[trimmed];

    // Clean extraneous spaces, punctuation (preserving + and #)
    const cleaned = trimmed
      .replace(/[\s\-_.]+/g, '')
      .replace(/\.js$/, 'js')
      .replace(/\.net$/, 'net');

    return this.aliasMap[cleaned] || cleaned;
  }

  /**
   * Calculates similarity between candidate skills and required skills
   * Rejects empty skills and avoids substring false positives (B27)
   */
  evaluateSkillMatch(candidateSkills = [], targetSkills = []) {
    if (!targetSkills || targetSkills.length === 0) {
      return { score: 100, matched: [], missing: [] };
    }

    const normalizedCandidateSkills = (candidateSkills || [])
      .map((s) => ({
        original: s,
        normalized: this.normalizeSkill(s)
      }))
      .filter((c) => c.normalized.length > 0);

    const matched = [];
    const missing = [];

    for (const target of targetSkills) {
      const normTarget = this.normalizeSkill(target);
      if (!normTarget) continue;

      // Exact canonical match only — no uncontrolled substring inclusion
      const found = normalizedCandidateSkills.find((c) => c.normalized === normTarget);

      if (found) {
        matched.push(target);
      } else {
        missing.push(target);
      }
    }

    const ratio = targetSkills.length > 0 ? matched.length / targetSkills.length : 1;
    const score = Math.round(ratio * 100);

    return { score, matched, missing };
  }

  /**
   * Evaluates candidate experience vs job requirement with overlap de-duplication
   */
  evaluateExperience(candidateProfile, job) {
    const requiredMin = job.experience?.minYears ?? 0;
    if (requiredMin === 0) return 100;

    let candidateYears = 0;
    if (candidateProfile.experience && candidateProfile.experience.length > 0) {
      const intervals = candidateProfile.experience
        .filter((exp) => exp.startDate)
        .map((exp) => {
          const start = new Date(exp.startDate).getTime();
          const end = exp.endDate ? new Date(exp.endDate).getTime() : (exp.isCurrent ? Date.now() : start);
          return { start, end: Math.max(start, end) };
        })
        .sort((a, b) => a.start - b.start);

      if (intervals.length > 0) {
        const merged = [intervals[0]];
        for (let i = 1; i < intervals.length; i++) {
          const prev = merged[merged.length - 1];
          const curr = intervals[i];
          if (curr.start <= prev.end) {
            prev.end = Math.max(prev.end, curr.end);
          } else {
            merged.push(curr);
          }
        }
        const totalMs = merged.reduce((acc, span) => acc + (span.end - span.start), 0);
        candidateYears = totalMs / (1000 * 60 * 60 * 24 * 365.25);
      }
    }

    if (candidateYears >= requiredMin) return 100;
    if (candidateYears === 0) return 40; // Entry level baseline
    return Math.round(Math.min(100, (candidateYears / requiredMin) * 100));
  }

  /**
   * Evaluates education alignment
   */
  evaluateEducation(candidateProfile, job) {
    if (!job.education || !job.education.degree) return 100;
    if (!candidateProfile.education || candidateProfile.education.length === 0) return 50;

    const targetDegree = job.education.degree.toLowerCase();
    const hasDegreeMatch = candidateProfile.education.some((edu) =>
      (edu.degree && edu.degree.toLowerCase().includes(targetDegree)) ||
      (edu.fieldOfStudy && job.education.field && edu.fieldOfStudy.toLowerCase().includes(job.education.field.toLowerCase()))
    );

    return hasDegreeMatch ? 100 : 75;
  }

  /**
   * Evaluates candidate career interests vs job role & title
   */
  evaluateCareerInterests(candidateProfile, job) {
    const interests = candidateProfile.careerInterests || [];
    const preferredRoles = candidateProfile.preferredJobRoles || [];
    const combinedInterests = [...interests, ...preferredRoles]
      .filter(Boolean)
      .map((i) => i.toLowerCase().trim());

    if (combinedInterests.length === 0) return 70; // Neutral score

    const jobText = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    const hasMatch = combinedInterests.some((interest) => interest && jobText.includes(interest));

    return hasMatch ? 100 : 60;
  }

  /**
   * Comprehensive Match Calculation
   */
  calculateMatch(candidateProfile, job) {
    const candidateSkillsSet = new Set([
      ...(candidateProfile.skills || []),
      ...(candidateProfile.projects ? candidateProfile.projects.flatMap((p) => p.technologies || []) : [])
    ]);
    const allCandidateSkills = Array.from(candidateSkillsSet);

    // 1. Required Skills Match (50%)
    const reqMatch = this.evaluateSkillMatch(allCandidateSkills, job.requiredSkills || []);
    // 2. Preferred Skills Match (15%)
    const prefMatch = this.evaluateSkillMatch(allCandidateSkills, job.preferredSkills || []);
    // 3. Experience Match (15%)
    const expScore = this.evaluateExperience(candidateProfile, job);
    // 4. Education Match (10%)
    const eduScore = this.evaluateEducation(candidateProfile, job);
    // 5. Career Interests Match (10%)
    const interestScore = this.evaluateCareerInterests(candidateProfile, job);

    const totalWeightedScore = Math.round(
      reqMatch.score * this.weights.requiredSkills +
      prefMatch.score * this.weights.preferredSkills +
      expScore * this.weights.experience +
      eduScore * this.weights.education +
      interestScore * this.weights.careerInterests
    );

    const finalScore = Math.min(100, Math.max(10, totalWeightedScore));

    // Generate insightful human-like explanation
    let explanation = '';
    if (reqMatch.matched.length > 0 && reqMatch.missing.length === 0) {
      explanation = `Excellent match! Matches all required core skills (${reqMatch.matched.slice(0, 4).join(', ')}).`;
    } else if (reqMatch.matched.length > 0) {
      explanation = `Strong match in ${reqMatch.matched.slice(0, 3).join(', ')}.`;
      if (reqMatch.missing.length > 0) {
        explanation += ` Missing experience in ${reqMatch.missing.slice(0, 3).join(', ')}.`;
      }
    } else {
      explanation = `Fundamental skill gap. Missing critical requirements: ${(reqMatch.missing || []).slice(0, 3).join(', ')}.`;
    }

    let recommendation = 'Consider applying';
    if (finalScore >= 85) recommendation = 'Highly Recommended Candidate / Top Match';
    else if (finalScore >= 70) recommendation = 'Good Candidate Match';
    else if (finalScore >= 50) recommendation = 'Moderate Candidate Match with Upskilling Required';
    else recommendation = 'Skill Gap Too High';

    return {
      matchScore: finalScore,
      matchedSkills: reqMatch.matched,
      missingSkills: reqMatch.missing,
      recommendation,
      explanation,
      breakdown: {
        requiredSkillsScore: reqMatch.score,
        preferredSkillsScore: prefMatch.score,
        experienceScore: expScore,
        educationScore: eduScore,
        careerInterestsScore: interestScore
      }
    };
  }
}

module.exports = new MatchingEngine();
