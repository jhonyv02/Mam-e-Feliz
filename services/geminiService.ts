import { GoogleGenAI, Modality } from "@google/genai";
import { QuizAnswers } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper para retentar operações em caso de erro 500 (transiente)
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Verifica se é erro de servidor (500 ou 503) ou mensagem contendo 500
    const isServerError = error.message?.includes('500') || error.status === 500 || error.status === 503;
    
    if (retries > 0 && isServerError) {
      console.warn(`Erro do servidor detectado. Retentando... (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2); // Backoff exponencial
    }
    throw error;
  }
}

export const generatePersonalizedPlan = async (answers: QuizAnswers): Promise<string> => {
  try {
    return await retryOperation(async () => {
      const prompt = `
        Atue como uma consultora de amamentação especialista, humana, muito empática e carinhosa.
        Uma mãe acabou de fazer uma autoavaliação com os seguintes dados:
        - Nível de dor (0-10): ${answers.painLevel}
        - Tipo de dor: ${answers.painType}
        - Estado do mamilo: ${answers.nippleCondition}
        - Estado emocional: ${answers.emotion}

        Por favor, crie um plano de ação curto, acolhedor e personalizado para ela.
        Use formatação Markdown simples.
        Estrutura da resposta:
        1. Uma frase de acolhimento validando o sentimento dela.
        2. O que pode estar causando essa dor específica.
        3. 3 passos práticos para ela fazer na próxima mamada.
        4. Uma mensagem de esperança.

        Não julgue, não use termos técnicos difíceis. Seja como uma amiga sábia.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Não foi possível gerar o plano agora. Tente novamente mais tarde.";
    });
  } catch (error) {
    console.error("Erro ao gerar plano após tentativas:", error);
    return "Ocorreu um erro ao conectar com nossa especialista virtual. Por favor, verifique sua conexão e tente novamente.";
  }
};

export const generateSOSAudio = async (): Promise<ArrayBuffer | null> => {
  try {
    return await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: 'Oi querida. Respire fundo. Você está indo muito bem. A dor vai passar. Solte os ombros, relaxe o maxilar. Você e seu bebê estão aprendendo juntos. Não se culpe. Estamos aqui com você.' }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
        // Decode base64 to ArrayBuffer
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
      return null;
    });
  } catch (error) {
    console.error("Erro ao gerar áudio após tentativas:", error);
    return null;
  }
};