import { GoogleGenAI } from '@google/genai';
import { TradeRoute } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAIInsight(route: TradeRoute) {
  if (!process.env.GEMINI_API_KEY) return "AI insights are currently unavailable. Please check your API configuration.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an expert maritime supply chain analyst. 
        Analyze the following trade route risk data for a shipping route from ${route.origin} to ${route.destination}:
        - Overall Risk Score: ${route.riskScore}/100
        - Port Congestion Risk: ${route.portCongestionRisk}%
        - Weather Risk: ${route.weatherRisk}%
        - Freight Rate Volatility: ${route.freightRateRisk}%
        
        Provide a concise 2-sentence operational intelligence update for an SME exporter. 
        Focus on the most critical risk factor and suggest a brief mitigation strategy.
        Maintain a professional, urgent, and technical tone.
      `,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Intelligence Error:", error);
    return "Unable to generate real-time AI intelligence at this moment. Proceed with standard operational protocols.";
  }
}
