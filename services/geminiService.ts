import { GoogleGenAI, Type } from "@google/genai";
import { IncidentCategory, IncidentPriority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalysisResult {
  category: IncidentCategory;
  priority: IncidentPriority;
  summary: string;
  technicianNotes: string;
}

export const analyzeIncidentDescription = async (description: string): Promise<AnalysisResult> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Analiza el siguiente reporte de incidencia de alumbrado público: "${description}".
      
      Tu tarea es clasificar el problema, determinar la prioridad basada en el peligro potencial (cables expuestos o postes caídos son críticos),
      generar un resumen corto, y dar notas técnicas sugeridas para el electricista.
      
      Categorias validas: "Foco Fundido", "Intermitente", "Poste Dañado", "Cableado Expuesto", "Otro".
      Prioridades validas: "Baja", "Media", "Alta", "Crítica".
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: Object.values(IncidentCategory) },
            priority: { type: Type.STRING, enum: Object.values(IncidentPriority) },
            summary: { type: Type.STRING, description: "Resumen de 5-7 palabras para el dashboard" },
            technicianNotes: { type: Type.STRING, description: "Sugerencia técnica de 1 frase (ej: Llevar grúa, requiere cambio de cableado)" }
          },
          required: ["category", "priority", "summary", "technicianNotes"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      category: IncidentCategory.OTHER,
      priority: IncidentPriority.MEDIUM,
      summary: "Revisión manual requerida",
      technicianNotes: "No se pudo analizar automáticamente."
    };
  }
};