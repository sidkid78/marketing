import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SecurityFinding, PerformanceIssue, QualityIssue, CodeReviewReport } from "../types";

// Initialize the client
// NOTE: Ideally, process.env.API_KEY is populated. 
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';
const SYNTHESIS_MODEL_NAME = 'gemini-2.5-flash'; // Using flash for speed in demo, Pro is better for synthesis

// Schemas
const securitySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
      issue_type: { type: Type.STRING },
      location: { type: Type.STRING },
      description: { type: Type.STRING },
      recommendation: { type: Type.STRING },
    },
    required: ["severity", "issue_type", "location", "description", "recommendation"],
  },
};

const performanceSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
      issue_type: { type: Type.STRING },
      location: { type: Type.STRING },
      description: { type: Type.STRING },
      improvement: { type: Type.STRING },
    },
    required: ["severity", "issue_type", "location", "description", "improvement"],
  },
};

const qualitySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, enum: ["readability", "maintainability", "documentation"] },
      location: { type: Type.STRING },
      description: { type: Type.STRING },
      suggestion: { type: Type.STRING },
    },
    required: ["category", "location", "description", "suggestion"],
  },
};

const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overall_score: { type: Type.INTEGER },
    security_findings: securitySchema,
    performance_issues: performanceSchema,
    quality_issues: qualitySchema,
    summary: { type: Type.STRING },
    approved: { type: Type.BOOLEAN },
  },
  required: ["overall_score", "security_findings", "performance_issues", "quality_issues", "summary", "approved"],
};


export const analyzeSecurity = async (code: string, language: string): Promise<SecurityFinding[]> => {
  const prompt = `
  # Security Code Review
  ## Code Language: ${language}
  ## Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  ## Instructions
  Perform a thorough security analysis. Identify:
  1. Authentication/Authorization issues
  2. Input validation problems
  3. SQL injection vulnerabilities
  4. XSS vulnerabilities
  5. CSRF vulnerabilities
  6. Sensitive data exposure
  7. Insecure dependencies
  8. Cryptography issues

  For EACH finding, provide:
  - Severity (HIGH/MEDIUM/LOW)
  - Issue type
  - Exact location in code
  - Description of the vulnerability
  - Specific recommendation to fix
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a security expert specializing in code security analysis.",
        responseMimeType: "application/json",
        responseSchema: securitySchema,
        temperature: 0.3,
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as SecurityFinding[];
    }
    return [];
  } catch (error) {
    console.error("Security Analysis Error:", error);
    return [];
  }
};

export const analyzePerformance = async (code: string, language: string): Promise<PerformanceIssue[]> => {
  const prompt = `
  # Performance Code Review
  ## Code Language: ${language}
  ## Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  ## Instructions
  Analyze code for performance issues:
  1. Time complexity problems (O(n²) when O(n) possible)
  2. Memory leaks
  3. Inefficient database queries (N+1 queries)
  4. Missing caching opportunities
  5. Blocking operations that should be async
  6. Resource leaks
  7. Unnecessary computations

  For EACH issue, provide:
  - Severity (HIGH/MEDIUM/LOW)
  - Issue type
  - Exact location
  - Description of the problem
  - Specific performance improvement
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a performance optimization expert.",
        responseMimeType: "application/json",
        responseSchema: performanceSchema,
        temperature: 0.3,
      }
    });
    if (response.text) {
        return JSON.parse(response.text) as PerformanceIssue[];
    }
    return [];
  } catch (error) {
    console.error("Performance Analysis Error:", error);
    return [];
  }
};

export const analyzeQuality = async (code: string, language: string): Promise<QualityIssue[]> => {
  const prompt = `
  # Code Quality Review
  ## Code Language: ${language}
  ## Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  ## Instructions
  Analyze code quality:
  1. Readability issues
  2. Maintainability concerns
  3. Documentation gaps
  4. Naming convention violations
  5. Code organization problems
  6. Design pattern opportunities
  7. DRY violations

  For EACH issue, provide:
  - Category (readability/maintainability/documentation)
  - Location
  - Description
  - Improvement suggestion
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a code quality expert.",
        responseMimeType: "application/json",
        responseSchema: qualitySchema,
        temperature: 0.4,
      }
    });
    if (response.text) {
        return JSON.parse(response.text) as QualityIssue[];
    }
    return [];
  } catch (error) {
    console.error("Quality Analysis Error:", error);
    return [];
  }
};

export const synthesizeReport = async (
  code: string,
  securityFindings: SecurityFinding[],
  performanceIssues: PerformanceIssue[],
  qualityIssues: QualityIssue[]
): Promise<CodeReviewReport | null> => {
  
  const prompt = `
  # Code Review Synthesis

  ## Agent Findings
  ### Security Findings (${securityFindings.length} issues)
  ${JSON.stringify(securityFindings)}

  ### Performance Issues (${performanceIssues.length} issues)
  ${JSON.stringify(performanceIssues)}

  ### Quality Issues (${qualityIssues.length} issues)
  ${JSON.stringify(qualityIssues)}

  ## Instructions
  Create a comprehensive review report:
  1. Calculate overall_score (0-100) based on:
     - HIGH severity: -20 points each
     - MEDIUM severity: -10 points each
     - LOW severity: -5 points each
     - Start at 100, subtract penalties
  2. Provide 2-3 paragraph summary highlighting most critical issues.
  3. Set approved=true only if:
     - No HIGH severity issues
     - Overall score >= 70
  
  Note: Return the full findings lists in the response as well.
  `;

  try {
    const response = await ai.models.generateContent({
      model: SYNTHESIS_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior code reviewer synthesizing findings.",
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.5,
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as CodeReviewReport;
    }
    return null;
  } catch (error) {
    console.error("Synthesis Error:", error);
    return null;
  }
};