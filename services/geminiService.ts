
import { GoogleGenAI } from "@google/genai";

// Standard initialization as per SDK rules.
// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCodeFeedback = async (
  code: string,
  levelTitle: string,
  levelObjective: string,
  isSuccess: boolean
) => {
  // Use gemini-3-pro-preview for complex coding and reasoning tasks as per guidelines.
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    You are 'GX-AI', a world-class coding mentor specialized in Python and block-based learning. 
    You are currently assisting a student at a Martian Outpost.
    
    Guidelines:
    - Keep responses concise (2-3 sentences max).
    - Be encouraging and enthusiastic.
    - If successful: Explain one Python concept they just used (like function calls).
    - If failed: Give a logical hint about the grid coordinates without giving the full code.
    - Use space/sci-fi metaphors sparingly to keep it fun.
  `;

  const prompt = `
    Mission Data:
    - Level Title: ${levelTitle}
    - Objective: ${levelObjective}
    - Mission Successful: ${isSuccess}
    
    Student's Python Code:
    \`\`\`python
    ${code}
    \`\`\`
    
    Analyze the code and provide a quick transmission back to the student.
  `;

  try {
    // Calling generateContent with the model name and prompt directly.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });
    
    // Direct access to the .text property as per guidelines (not a method).
    return response.text;
  } catch (error) {
    console.error("Gemini AI Uplink Failure:", error);
    return "Mission update: Telemetry suggests you're on the right track. Adjust your vector and try again!";
  }
};
