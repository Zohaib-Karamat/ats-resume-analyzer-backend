export const generateCoverLetterPrompt = (
  resumeText,
  jobDescriptionText,
  companyName,
  jobTitle,
) => {
  return `
You are an expert career coach and professional copywriter.
Your task is to write a highly tailored, compelling, and professional cover letter for a candidate based on their Resume and the Job Description provided below.

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescriptionText}

RESUME:
${resumeText}

Instructions:
1. The cover letter should be professional, engaging, and aligned with standard business practices.
2. It should highlight the candidate's strengths and most relevant experiences from the resume that specifically match the job description.
3. Keep it concise (around 3 to 4 paragraphs).
4. Do NOT use placeholders like "[Your Name]" or "[Your Address]" if the information can be reasonably inferred from the resume. If it can't be inferred, you can use minimalistic placeholders like "[Candidate Name]" so the user knows what to fill in.
5. Provide the result EXACTLY in the following JSON structure. Do NOT wrap the JSON in Markdown formatting. Return ONLY valid JSON:
{
  "coverLetter": "The generated cover letter text..."
}
`;
};
