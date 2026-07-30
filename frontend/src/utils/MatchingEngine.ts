interface JobRequirement {
  requirement_id?: number;
  requirement_name: string;
  is_mandatory: boolean;
  type_id: number; // 1 = Tech, 2 = Soft, 3 = Domain
  embedding?: number[] | string; // Vector array from Supabase
}

export interface JobConfig {
  jobTitle?: string;
  minTotalExpYears: number;
  minRelevantExpYears: number;
  academicEquivalent: boolean;
  minEduLevel: string;
  strictEducationMatch: boolean;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper to handle partial/fuzzy string matching for skills and languages
export function isSkillMatch(
  requirementName: string, 
  candidateSkills: string[],
  reqEmbedding?: number[] | string,
  candidateEmbeddings: { name: string, embedding: number[] | string }[] = [],
  equivalenceMatches: string[] = []
): boolean {
  
  // 0. Check if this requirement is in the AI-approved equivalence matches
  const reqLower = requirementName.toLowerCase().trim();
  if (equivalenceMatches.some(e => e.toLowerCase().trim() === reqLower)) {
    return true;
  }

  // 1. Try Semantic Vector Match if embeddings exist
  let parsedReqEmbedding: number[] | null = null;
  if (reqEmbedding) {
    parsedReqEmbedding = typeof reqEmbedding === 'string' ? JSON.parse(reqEmbedding) : reqEmbedding;
  }
  
  if (parsedReqEmbedding && candidateEmbeddings.length > 0) {
    const THRESHOLD = 0.76; // Semantic match threshold lowered for better soft-skill flexibility
    const hasVectorMatch = candidateEmbeddings.some(cand => {
      if (!cand.embedding) return false;
      const candVec = typeof cand.embedding === 'string' ? JSON.parse(cand.embedding) : cand.embedding;
      const sim = cosineSimilarity(parsedReqEmbedding!, candVec);
      return sim >= THRESHOLD;
    });
    
    if (hasVectorMatch) return true;
  }

  // 2. Fallback to fuzzy text match
  const req = requirementName.toLowerCase();
  
  return candidateSkills.some(skill => {
    const cand = skill.toLowerCase();
    
    // Direct match
    if (req === cand) return true;
    
    // Handle 'english speaker' vs 'english'
    if (req.includes('english') && cand.includes('english')) return true;
    
    // Handle 'problem solver' vs 'problem solving'
    if (req.includes('problem') && req.includes('solv') && cand.includes('problem') && cand.includes('solv')) return true;
    
    // Token overlap check for robust fuzzy matching
    // (e.g., "SQL for data query" vs "sql", "procurement planning" vs "procurement management")
    if (req.length >= 2 && cand.length >= 2) {
      if (req === cand || cand === req) return true;
      
      // Tokenize by spaces and special characters
      const reqTokens = req.split(/[\s\-]+/).filter(t => t.length > 2);
      const candTokens = cand.split(/[\s\-]+/).filter(t => t.length > 2);
      
      let matchCount = 0;
      for (const t of reqTokens) {
        if (candTokens.includes(t)) matchCount++;
      }
      
      if (reqTokens.length > 0 && candTokens.length > 0) {
        const overlapRatio = matchCount / Math.min(reqTokens.length, candTokens.length);
        if (overlapRatio >= 0.5) return true;
      }
      
      // Keep direct substring match as a fallback for cases where tokens don't split well
      if (req.length >= 3 && cand.length >= 3) {
        if (req.includes(cand) || cand.includes(req)) return true;
      }
    }
    
    // Handle 'communication' vs language proficiency
    if (req.includes('communication') && (cand.includes('bilingual') || cand.includes('native') || cand.includes('professional') || cand.includes('presentation') || cand.includes('speaking'))) {
      return true;
    }
    
    return false;
  });
}

export function evaluateCandidateMatch(
  jobRequirements: JobRequirement[],
  jobConfig: JobConfig,
  candidateProfile: any,
  equivalenceMatches: string[] = []
) {
  let maxPossiblePoints = 0;
  
  let mandatoryPoints = 0;
  let optionalPoints = 0;
  let experiencePoints = 0;
  let educationPoints = 0;

  const requirementMatches: { requirement_id: number | null, criteria: string, score_value: number }[] = [];

  // 1. Compile all parsed candidate values into lookup sets
  const candidateSkillsSet = new Set([
    ...(candidateProfile.skills?.technical || []).map((s: string) => s.toLowerCase().trim()),
    ...(candidateProfile.skills?.soft || []).map((s: string) => s.toLowerCase().trim())
  ]);

  const candidateLanguagesSet = new Set(
    (candidateProfile.languages || []).map((l: any) => `${l.language || l.name} ${l.proficiency || ''}`.toLowerCase().trim())
  );

  // 2. Loop Through Skill & Language Requirements
  jobRequirements.forEach((req) => {
    if (req.type_id === 4) return; // Skip degree requirements for standard skills scoring

    const itemWeight = req.is_mandatory ? 10 : 3;
    maxPossiblePoints += itemWeight;

    const reqName = req.requirement_name.toLowerCase().trim();

    const allCandidateSkills = [...candidateSkillsSet, ...candidateLanguagesSet];
    const candEmbeddings = candidateProfile.embedded_skills || [];
    
    let reqPoints = 0;
    // Check if requirement exists in skills or languages
    if (isSkillMatch(reqName, allCandidateSkills, req.embedding, candEmbeddings, equivalenceMatches)) {
      reqPoints = itemWeight;
      if (req.is_mandatory) {
        mandatoryPoints += itemWeight;
      } else {
        optionalPoints += itemWeight;
      }
    }

    if (req.requirement_id) {
      requirementMatches.push({
        requirement_id: req.requirement_id,
        criteria: req.requirement_name,
        score_value: reqPoints
      });
    }
  });

  // 3. Process Experience Requirements (Split into Total and Relevant, 5 points each)
  const totalExpWeight = 5;
  const relevantExpWeight = 5;
  maxPossiblePoints += (totalExpWeight + relevantExpWeight);
  
  // Calculate Formal Work Experience & Relevant Experience
  let candidateFormalExpYears = 0;
  let candidateRelevantExpYears = 0;

  if (candidateProfile.work_experience && Array.isArray(candidateProfile.work_experience)) {
    const jobReqsForDomain = jobRequirements.filter(req => req.type_id !== 4);
    
    let formalMonths = 0;
    let relevantMonths = 0;

    candidateProfile.work_experience.forEach((exp: any) => {
      const duration = exp.duration_months || 0;
      
      // 1. Strict Job Scope Match (Total Experience)
      // Check if the past role title matches the target job title
      let isScopeMatch = false;
      if (jobConfig.jobTitle) {
        isScopeMatch = isSkillMatch(jobConfig.jobTitle, [exp.role || ""]);
      } else {
        isScopeMatch = true; // Fallback if no target title provided
      }
      
      if (isScopeMatch) {
        formalMonths += duration;
      }

      // 2. Broad Domain Match (Relevant Experience)
      // Check if the role or summary contains ANY of the job's required skills
      // We omit embeddings here to force a strict text-search within the summary
      const expText = `${exp.role || ""} ${exp.summary || ""}`;
      const isDomainMatch = jobReqsForDomain.some(req => {
         return isSkillMatch(req.requirement_name, [expText]);
      });

      if (isDomainMatch || isScopeMatch) {
        relevantMonths += duration;
      }
    });

    candidateFormalExpYears = formalMonths / 12;
    candidateRelevantExpYears = relevantMonths / 12;

    // Add Academic/Hackathon Equivalent Bonus to Relevant Experience if enabled
    if (jobConfig.academicEquivalent && candidateProfile.calculated_metrics?.total_epe_months) {
      const rawTotalFormalMonths = candidateProfile.work_experience.reduce((sum: number, exp: any) => sum + (exp.duration_months || 0), 0);
      const academicBonusMonths = Math.max(0, candidateProfile.calculated_metrics.total_epe_months - rawTotalFormalMonths);
      candidateRelevantExpYears += (academicBonusMonths / 12);
    }

  } else if (candidateProfile.years_of_experience) {
    // Fallback if no detailed timeline is available
    candidateFormalExpYears = Number(candidateProfile.years_of_experience);
    candidateRelevantExpYears = candidateFormalExpYears;
    if (jobConfig.academicEquivalent && candidateProfile.calculated_metrics?.total_epe_months) {
      candidateRelevantExpYears = candidateProfile.calculated_metrics.total_epe_months / 12;
    }
  }

  // Partial Experience Credit
  const totalExpRatio = jobConfig.minTotalExpYears > 0 
    ? Math.min(candidateFormalExpYears / jobConfig.minTotalExpYears, 1) 
    : 1; // Full points if no requirement
    
  const relevantExpRatio = jobConfig.minRelevantExpYears > 0
    ? Math.min(candidateRelevantExpYears / jobConfig.minRelevantExpYears, 1)
    : 1;

  experiencePoints = (totalExpWeight * totalExpRatio) + (relevantExpWeight * relevantExpRatio);
  
  requirementMatches.push({
    requirement_id: null,
    criteria: 'Experience Match',
    score_value: experiencePoints
  });

  // 4. Process Education Level Threshold (Counted as a Mandatory item)
  const eduWeight = 10;
  maxPossiblePoints += eduWeight;
  
  const tierMap: Record<string, number> = { 
    "No Requirement": 0, "SPM / O-Level": 1, "Diploma": 2, "Bachelor's Degree": 3, "Master's Degree": 4, "PhD": 5,
    "no_requirement": 0, "spm": 1, "diploma": 2, "bachelor": 3, "master": 4, "phd": 5
  };
  const jobMinTier = tierMap[jobConfig.minEduLevel] || 0;
  const candidateTier = tierMap[candidateProfile.education?.normalized_category] || 0;

  if (candidateTier >= jobMinTier) {
    // 4.1 Check for Acceptable Degrees (type_id = 4)
    const degreeRequirements = jobRequirements.filter(req => req.type_id === 4);
    let relevanceScore = 0;

    if (degreeRequirements.length > 0) {
      // Semantic check against accepted degrees
      const candEmbeddings = candidateProfile.embedded_skills || [];
      const hasDegreeMatch = degreeRequirements.some(req => {
        const cleanName = req.requirement_name.trim().toLowerCase();
        const matched = isSkillMatch(cleanName, [candidateProfile.education?.raw_title?.toLowerCase() || ""], req.embedding, candEmbeddings, equivalenceMatches);
        if (matched && req.requirement_id) {
          requirementMatches.push({
            requirement_id: req.requirement_id,
            criteria: req.requirement_name,
            score_value: eduWeight // give full weight if matched
          });
        }
        return matched;
      });
      relevanceScore = hasDegreeMatch ? 1.0 : (jobConfig.strictEducationMatch ? 0 : 0.5);
    } else {
      // Fallback to generic tech relevance score if HR didn't specify degrees
      relevanceScore = candidateProfile.education?.semantic_relevance_score ?? 1.0;
      if (jobConfig.strictEducationMatch && relevanceScore < 0.8) {
         relevanceScore = 0; // Strict filter applies
      }
    }
    
    educationPoints = eduWeight * relevanceScore;
  }
  
  requirementMatches.push({
    requirement_id: null,
    criteria: 'Education Match',
    score_value: educationPoints
  });

  // 5. Calculate Final Percentage
  if (maxPossiblePoints === 0) return { finalPercentage: 0, breakdown: { mandatoryPoints, optionalPoints, experiencePoints, educationPoints }, requirementMatches };
  
  const candidatePointsEarned = mandatoryPoints + optionalPoints + experiencePoints + educationPoints;
  const finalPercentage = (candidatePointsEarned / maxPossiblePoints) * 100;
  
  return {
    finalPercentage: parseFloat(finalPercentage.toFixed(1)),
    breakdown: {
      mandatoryPoints,
      optionalPoints,
      experiencePoints,
      educationPoints
    },
    requirementMatches
  };
}

