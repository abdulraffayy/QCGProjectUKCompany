import OpenAI from "openai";
import { z } from "zod";
import { QAQFLevels, QAQFCharacteristics } from "../client/src/lib/qaqf";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Schema for content generation request
export const contentGenerationSchema = z.object({
  contentType: z.string(),
  qaqfLevel: z.number().min(1).max(9),
  subject: z.string().min(3),
  characteristics: z.array(z.string()),
  additionalInstructions: z.string().optional(),
  sourceType: z.enum(["internal", "uploaded"]).optional().default("internal"),
  sourceContent: z.string().optional(),
});

export type ContentGenerationRequest = z.infer<typeof contentGenerationSchema>;

// Generate academic content
export async function generateContent(request: ContentGenerationRequest) {
  const { contentType, qaqfLevel, subject, characteristics, additionalInstructions, sourceType, sourceContent } = request;
  
  // Get QAQF level details
  const qaqfLevelDetails = QAQFLevels.find(level => level.level === qaqfLevel);
  
  // Get characteristics details
  const characteristicsDetails = QAQFCharacteristics.filter(c => 
    characteristics.includes(c.name) || characteristics.includes(c.id.toString())
  );
  
  // Build the prompt for content generation
  let prompt = `Generate academic content on "${subject}" following the QAQF framework level ${qaqfLevel} (${qaqfLevelDetails?.name || 'Unknown'}).
  
The content should incorporate the following QAQF characteristics:
${characteristicsDetails.map(c => `- ${c.name}: ${c.description}`).join('\n')}

The content should strictly be based on verified academic sources and follow British academic standards.`;

  // Add source content if provided
  if (sourceType === "uploaded" && sourceContent) {
    prompt += `\n\nUse the following source material as a reference for generating the content:\n\n${sourceContent}\n\n`;
    prompt += "Only use information from this source and do not add any unverified information from external sources.";
  } else {
    prompt += "\n\nGenerate content using only verifiable academic knowledge within the subject area. Do not reference unverified sources.";
  }

  // Add additional instructions if provided
  if (additionalInstructions) {
    prompt += `\n\nAdditional instructions:\n${additionalInstructions}`;
  }

  // Add output format instructions
  prompt += `\n\nPlease structure the response as a JSON object with the following format:
  {
    "title": "An appropriate title for the content",
    "content": "The main body of the content with appropriate markdown formatting",
    "moduleCode": "A suitable module code for academic classification (e.g., EDU-573)"
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert academic content creator specialized in generating high-quality educational materials according to the Quality Academic Question Framework (QAQF). You create content that strictly follows British academic standards and only includes verified information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and return the generated content
    const content = JSON.parse(response.choices[0].message.content);
    return content;
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw new Error("Failed to generate content. Please try again later.");
  }
}

// Verify content against QAQF framework
export async function verifyContent(content: string, qaqfLevel: number) {
  const qaqfLevelDetails = QAQFLevels.find(level => level.level === qaqfLevel);
  
  const prompt = `Verify the following academic content against QAQF framework level ${qaqfLevel} (${qaqfLevelDetails?.name || 'Unknown'}).
  
Content to verify:
---
${content}
---

Evaluate this content against each QAQF characteristic and provide a score from 1-10 for each:
${QAQFCharacteristics.map(c => `- ${c.name}`).join('\n')}

Also provide overall feedback and suggestions for improvement.

Please structure the response as a JSON object with the following format:
{
  "score": 0-100,
  "feedback": "Overall assessment and recommendations",
  "characteristics": {
    "Knowledge and understanding": 0-10,
    "Applied knowledge": 0-10,
    "Cognitive skills": 0-10,
    "Communication": 0-10,
    "Autonomy, accountability & working with others": 0-10,
    "Digitalisation & AI": 0-10,
    "Sustainability & ecological": 0-10,
    "Reflective & creative": 0-10,
    "Futuristic/Genius Skills": 0-10
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in academic quality assessment using the Quality Academic Question Framework (QAQF). Your role is to evaluate academic content against this framework and provide detailed feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and return the verification results
    const verificationResults = JSON.parse(response.choices[0].message.content);
    return verificationResults;
  } catch (error) {
    console.error("Error verifying content with OpenAI:", error);
    throw new Error("Failed to verify content. Please try again later.");
  }
}

// Check content against British academic standards
export async function checkBritishStandards(content: string) {
  const prompt = `Review the following academic content and evaluate it against British academic standards:
  
Content to review:
---
${content}
---

Verify that the content:
1. Uses British English spelling and grammar
2. Follows British academic citation and referencing style
3. Meets appropriate academic tone and formality
4. Uses terminology consistent with British academic conventions

Please structure the response as a JSON object with the following format:
{
  "compliant": true/false,
  "issues": ["List any issues found"],
  "suggestions": ["List suggestions for improvement"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in British academic standards and quality assessment. Your role is to evaluate academic content against British standards and provide detailed feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and return the evaluation results
    const evaluationResults = JSON.parse(response.choices[0].message.content);
    return evaluationResults;
  } catch (error) {
    console.error("Error checking British standards with OpenAI:", error);
    throw new Error("Failed to check British standards. Please try again later.");
  }
}