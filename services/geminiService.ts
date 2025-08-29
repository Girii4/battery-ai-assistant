import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UploadedFile } from '../types';

// The API key is expected to be set in the execution environment.
// FIX: Use `process.env.API_KEY` to align with the coding guidelines for API key management.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResponse = async (userQuery: string, files: UploadedFile[]): Promise<string> => {
  try {
    const promptParts: { text: string }[] = [];

    // Add context from files if they exist
    if (files.length > 0) {
      const fileContext = files.map(file => 
        `--- START OF DOCUMENT: ${file.name} ---\n${file.content}\n--- END OF DOCUMENT: ${file.name} ---`
      ).join('\n\n');
      
      promptParts.push({ text: `Based on the following document(s), please answer the user's query.\n\n${fileContext}` });
    }
    
    // Add the user's query as the final part
    promptParts.push({ text: userQuery });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: promptParts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    // Add a fallback to prevent crashes on empty responses
    return response.text ?? "The AI did not provide a text response. Please try again.";
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