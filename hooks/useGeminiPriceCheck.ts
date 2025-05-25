// hooks/useGeminiPriceCheck.ts

import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

interface PriceCheckParams {
  name: string;
  description: string;
  price: number;
}

/**
 * Hook para evaluar si un precio es adecuado usando Gemini.
 * Retorna `checkPrice(params)` que devuelve la respuesta de la IA,
 * y `loading` para el estado de la llamada.
 */
export function useGeminiPriceCheck() {
  const [loading, setLoading] = useState(false);

  // Lee tu API key desde expo config
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY no configurada en app.json o app.config.js"
    );
  }

  // Inicializa el cliente de Gemini
  const ai = new GoogleGenAI({ apiKey });

  /**
   * Envía un prompt a Gemini para evaluar el precio.
   * Devuelve un string con la opinión / rango sugerido.
   */
  const checkPrice = async ({
    name,
    description,
    price,
  }: PriceCheckParams): Promise<string> => {
    setLoading(true);
    try {
      // Construye el prompt
      const prompt = `
Eres un asistente experto en comercio y precios de mercado.
Producto: "${name}"
Descripción: "${description}"
Precio propuesto: ${price} COP

¿Es este un buen precio comparado con el mercado actual? Si no lo es, sugiere un rango de precio adecuado. Sé conciso.
      `.trim();

      // Llamada a Gemini vía el submódulo models.generateContent
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",   // o la versión de modelo que uses
        contents: prompt,
      });

      // Extrae el texto de la respuesta
      const text = response.text ?? "";
      return text.trim();
    } finally {
      setLoading(false);
    }
  };

  return { checkPrice, loading };
}
