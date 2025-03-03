import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateLearningPath(skill: string): Promise<{
  title: string;
  description: string;
  steps: { title: string; description: string; resources: string[] }[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert curriculum designer. Create a detailed learning path with practical steps and resources.",
      },
      {
        role: "user",
        content: `Create a learning path for: ${skill}. Include a title, description, and detailed steps with resources.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}
