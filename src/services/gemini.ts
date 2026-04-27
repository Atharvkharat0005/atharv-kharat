import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing. Please provide a valid API key in your environment variables (GEMINI_API_KEY).");
  }
  return new GoogleGenAI({ apiKey });
};

const addWavHeader = (base64Pcm: string): string => {
  const pcmData = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + pcmData.length, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * bitsPerSample / 8, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, pcmData.length, true);
  
  const blob = new Blob([header, pcmData], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

export interface AdvisoryInput {
  cropName: string;
  soilType: string;
  fieldSize: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  location: string;
}

export interface AdvisoryOutput {
  fertilizerRec: string;
  irrigationRec: string;
  pestAdvice: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReason: string;
}

export const generateAdvisory = async (input: AdvisoryInput): Promise<AdvisoryOutput> => {
  const ai = getAI();
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a crop advisory and risk analysis for the following data:
    Crop: ${input.cropName}
    Soil: ${input.soilType}
    Field Size: ${input.fieldSize}
    Temperature: ${input.temperature}°C
    Humidity: ${input.humidity}%
    Rainfall: ${input.rainfall}mm
    Location: ${input.location}
    
    Provide recommendations for fertilizer, irrigation, and pest prevention.
    Also calculate a risk score (0-100), risk level (LOW, MEDIUM, HIGH), and reason.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fertilizerRec: { type: Type.STRING },
          irrigationRec: { type: Type.STRING },
          pestAdvice: { type: Type.STRING },
          riskScore: { type: Type.NUMBER },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          riskReason: { type: Type.STRING }
        },
        required: ["fertilizerRec", "irrigationRec", "pestAdvice", "riskScore", "riskLevel", "riskReason"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
};

export const diagnoseImage = async (base64Image: string, cropName: string): Promise<{ disease: string; confidence: number; treatment: string; prevention: string }> => {
  const ai = getAI();
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: `Diagnose the disease in this ${cropName} plant image. 
        Provide:
        1. Disease name
        2. Confidence score (0-100)
        3. Immediate treatment/solution
        4. Long-term prevention methods.
        Keep the advice practical for a farmer.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          disease: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          treatment: { type: Type.STRING },
          prevention: { type: Type.STRING }
        },
        required: ["disease", "confidence", "treatment", "prevention"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
};

export const generateVoiceAdvisory = async (text: string, voiceName: 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio ? addWavHeader(base64Audio) : "";
};
