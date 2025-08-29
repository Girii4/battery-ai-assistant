
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UploadedFile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        return `An error occurred while communicating with the AI: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI.";
  }
};
