export const generateAtsPrompt = (resumeText, jobDescriptionText) => {
  return `
You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
Your task is to analyze the following Resume against the provided Job Description.

JOB DESCRIPTION:
${jobDescriptionText}

RESUME:
${resumeText}

Analyze the resume strictly against the job description. Be objective and highly critical.

Provide the result EXACTLY in the following JSON structure. Do NOT wrap the JSON in Markdown formatting (no \`\`\`json or \`\`\`). Return ONLY valid JSON:
{
  "overallScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "grammarSuggestions": ["suggestion1"],
  "atsSuggestions": ["formatting suggestion1", "keyword suggestion2"],
  "summary": "A 2-3 sentence summary of the candidate's fit for the role."
}
`;
};
