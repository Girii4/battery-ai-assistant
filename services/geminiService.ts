import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UploadedFile } from '../types';

// The API key is expected to be set in the execution environment.
// The check for process.env.GEMINI_API_KEY was removed to prevent the app from crashing
// on load if the variable isn't immediately available, allowing the UI to render.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const buildPrompt = (userQuery: string, files: UploadedFile[]): string => {
  if (files.length === 0) {
    return userQuery;
  }

  const fileContext = files.map(file => 
    `--- START OF DOCUMENT: ${file.name} ---\n${file.content}\n--- END OF DOCUMENT: ${file.name} ---`
  ).join('\n\n');

  return `Based on the following document(s), please answer the user's query.
  
${fileContext}

User Query: "${userQuery}"`;
};

export const generateResponse = async (userQuery: string, files: UploadedFile[]): Promise<string> => {
  try {
    const prompt = buildPrompt(userQuery, files);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    if (error instanceof Error) {
        // Provide a more user-friendly error message
        if (error.message.includes('API key')) {
            return "Could not connect to the AI service. Please ensure the API key is configured correctly.";
        }
        return `An error occurred while communicating with the AI: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI.";
  }
};