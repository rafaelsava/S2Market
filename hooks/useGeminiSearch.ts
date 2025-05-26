// hooks/useGeminiSearch.ts
import { db } from "@/utils/FirebaseConfig";
import { GoogleGenAI } from "@google/genai";
import { collection, getDocs } from "firebase/firestore";
import { useState } from "react";


export function useGeminiSearch() {
  const [loading, setLoading] = useState(false);

  // Lee tu API key desde expo config
  const apiKey =  process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY no configurada en app.json o app.config.js"
    );
  }

  // Inicializa el cliente
  const ai = new GoogleGenAI({ apiKey });

  const getKeywords = async (userText: string): Promise<string[]> => {
    setLoading(true);
    try {
      // 1) Traer hasta 20 productos de Firestore
      const snap = await getDocs(collection(db, "products"));
      const ctx = snap.docs
        .slice(0, 20)
        .map((d) => {
          const { name, description } = d.data();
          return `- ${name}: ${description}`;
        })
        .join("\n");

      // 2) Montar prompt
      const prompt = `
Eres un asistente que recibe:
1) Contexto de productos disponibles:
${ctx}

2) Petición del usuario: "${userText}"

Devuelve sólo palabras clave separadas por comas (máx. 8) para buscar en la BD.
      `.trim();

      // 3) Llamada a Gemini vía la librería oficial
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      // La respuesta viene en response.text
      const text = response.text ?? "";

      // 4) Parsear a un array de keywords
      return text
        .split(/,|\n/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0)
        .slice(0, 8);
    } finally {
      setLoading(false);
    }
  };

  return { getKeywords, loading };
}
