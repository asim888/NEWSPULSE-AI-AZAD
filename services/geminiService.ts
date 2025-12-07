import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EnhancedArticleContent } from "../types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getEnv } from "../utils/env";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const key = getEnv('API_KEY');
    if (key) {
        ai = new GoogleGenAI({ apiKey: key });
    }
  }
  return ai;
};

const articleMemoryCache = new Map<string, EnhancedArticleContent>();
const audioMemoryCache = new Map<string, string>();

export const getDeviceVoiceLang = (tab: string): string => {
    switch (tab) {
        case 'urdu': return 'ur-IN';
        case 'hindi': return 'hi-IN';
        case 'telugu': return 'te-IN';
        default: return 'en-IN';
    }
};

export const enhanceArticle = async (
  id: string,
  title: string,
  description: string
): Promise<EnhancedArticleContent> => {
  if (articleMemoryCache.has(id)) {
    return articleMemoryCache.get(id)!;
  }

  if (isSupabaseConfigured()) {
    try {
        const { data, error } = await supabase!
            .from('ai_articles_cache')
            .select('data')
            .eq('article_id', id)
            .single();
        
        if (data && !error) {
            const content = data.data as EnhancedArticleContent;
            articleMemoryCache.set(id, content);
            return content;
        }
    } catch (e) {}
  }

  const aiClient = getAI();
  if (!aiClient) throw new Error("API Key not configured");

  const prompt = `
    You are a senior journalist for News Pulse AI.
    Based on the following news headline and snippet, write a comprehensive news update.
    
    Headline: "${title}"
    Snippet: "${description}"
    
    Your Tasks (Must provide all):
    1. Expand this into a full article (approx 250 words). Be objective, professional, and journalistic (English).
    2. Write a short summary (max 50 words) in English.
    3. Translate the *Full Article* (from step 1) into Roman Urdu (Urdu language written in English script).
    4. Translate the *Full Article* (from step 1) into Urdu (proper Urdu script/Nastaliq).
    5. Translate the *Full Article* (from step 1) into Hindi (Devanagari script).
    6. Translate the *Full Article* (from step 1) into Telugu (Telugu script).
    
    Output strictly in JSON format matching the schema.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullArticle: { type: Type.STRING },
            summaryShort: { type: Type.STRING },
            summaryRomanUrdu: { type: Type.STRING },
            summaryUrdu: { type: Type.STRING },
            summaryHindi: { type: Type.STRING },
            summaryTelugu: { type: Type.STRING },
            fullArticleRomanUrdu: { type: Type.STRING },
            fullArticleUrdu: { type: Type.STRING },
            fullArticleHindi: { type: Type.STRING },
            fullArticleTelugu: { type: Type.STRING },
          },
          required: [
            "fullArticle", "summaryShort", 
            "summaryRomanUrdu", "summaryUrdu", "summaryHindi", "summaryTelugu",
            "fullArticleRomanUrdu", "fullArticleUrdu", "fullArticleHindi", "fullArticleTelugu"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const content = JSON.parse(text) as EnhancedArticleContent;
    articleMemoryCache.set(id, content);

    if (isSupabaseConfigured()) {
        supabase!.from('ai_articles_cache')
            .upsert({ article_id: id, data: content }, { onConflict: 'article_id' })
            .then(() => {});
    }
    
    return content;

  } catch (error) {
    console.error("Gemini Text Error:", error);
    return {
      fullArticle: description + "\n\n(AI Expansion currently unavailable. Please check back later.)",
      summaryShort: description,
      summaryRomanUrdu: "Maaf kijiye, abhi tarjuma dastiyab nahi hai.",
      summaryUrdu: "معاف کیجئے، ابھی ترجمہ دستیاب نہیں ہے۔",
      summaryHindi: "क्षमा करें, अनुवाद अभी उपलब्ध नहीं है।",
      summaryTelugu: "క్షమించండి, అనువాదం ప్రస్తుతం అందుబాటులో లేదు.",
      fullArticleRomanUrdu: description,
      fullArticleUrdu: description,
      fullArticleHindi: description,
      fullArticleTelugu: description
    };
  }
};

export const generateNewsAudio = async (text: string): Promise<{ audioData: string }> => {
  const cacheKey = btoa(unescape(encodeURIComponent(text.trim().slice(0, 100) + text.length))); 

  if (audioMemoryCache.has(cacheKey)) {
    return { audioData: audioMemoryCache.get(cacheKey)! };
  }

  if (isSupabaseConfigured()) {
      try {
          const { data, error } = await supabase!
              .from('ai_audio_cache')
              .select('audio_data')
              .eq('text_hash', cacheKey)
              .single();
          
          if (data && !error) {
              audioMemoryCache.set(cacheKey, data.audio_data);
              return { audioData: data.audio_data };
          }
      } catch (e) {}
  }

  const aiClient = getAI();
  if (!aiClient) throw new Error("API Key not configured");

  const cleanText = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*#_`~>\[\]\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
      throw new Error("Audio generation failed: Text was empty after sanitization.");
  }

  // Increased limit to 2000 chars for full summary/translation reading
  const speechText = cleanText.slice(0, 2000);

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{
        parts: [{ text: speechText }]
      }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
        throw new Error("No audio data generated - Model may have refused content");
    }

    audioMemoryCache.set(cacheKey, base64Audio);

    if (isSupabaseConfigured()) {
        supabase!.from('ai_audio_cache')
            .upsert({ text_hash: cacheKey, audio_data: base64Audio }, { onConflict: 'text_hash' })
            .then(() => {});
    }

    return { audioData: base64Audio };

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};