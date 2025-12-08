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

const getOpenAIKey = () => getEnv('OPENAI_API_KEY');

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

// --- OPENAI HELPER FUNCTIONS ---

const generateWithOpenAI = async (prompt: string): Promise<EnhancedArticleContent> => {
    const apiKey = getOpenAIKey();
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini", // Cost effective and fast
            messages: [
                {
                    role: "system", 
                    content: "You are a senior journalist. Output strictly in valid JSON format." 
                },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI Chat Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as EnhancedArticleContent;
};

const generateAudioWithOpenAI = async (text: string): Promise<string> => {
    const apiKey = getOpenAIKey();
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "tts-1",
            input: text,
            voice: "alloy", // Neutral, clear voice
            response_format: "mp3"
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI TTS Error: ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    // Convert ArrayBuffer to Base64
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// --- MAIN EXPORTS ---

export const enhanceArticle = async (
  id: string,
  title: string,
  description: string
): Promise<EnhancedArticleContent> => {
  // 1. Check Memory Cache
  if (articleMemoryCache.has(id)) {
    return articleMemoryCache.get(id)!;
  }

  // 2. Check Supabase Cache (Save Once, Use Forever)
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

  const prompt = `
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
    
    Output strictly in JSON format matching this schema:
    {
      "fullArticle": "string",
      "summaryShort": "string",
      "summaryRomanUrdu": "string",
      "summaryUrdu": "string",
      "summaryHindi": "string",
      "summaryTelugu": "string",
      "fullArticleRomanUrdu": "string",
      "fullArticleUrdu": "string",
      "fullArticleHindi": "string",
      "fullArticleTelugu": "string"
    }
  `;

  let content: EnhancedArticleContent | null = null;

  // 3. Try Gemini API
  try {
    const aiClient = getAI();
    if (!aiClient) throw new Error("Gemini API Key missing");

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
    if (text) {
        content = JSON.parse(text) as EnhancedArticleContent;
    }
  } catch (geminiError) {
      console.warn("Gemini Generation Failed, trying OpenAI...", geminiError);
      
      // 4. Fallback to OpenAI API
      try {
          content = await generateWithOpenAI(prompt);
      } catch (openAiError) {
          console.error("OpenAI Generation Failed", openAiError);
      }
  }

  // 5. Handle Success or Complete Failure
  if (content) {
      // Success: Cache and Return
      articleMemoryCache.set(id, content);

      if (isSupabaseConfigured()) {
          supabase!.from('ai_articles_cache')
              .upsert({ article_id: id, data: content }, { onConflict: 'article_id' })
              .then(() => {});
      }
      return content;
  } else {
      // Failure: Return Local Fallback
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

  // 1. Check Memory Cache
  if (audioMemoryCache.has(cacheKey)) {
    return { audioData: audioMemoryCache.get(cacheKey)! };
  }

  // 2. Check Supabase Cache (Save Once, Use Forever)
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

  // Sanitize text
  const cleanText = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*#_`~>\[\]\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
      throw new Error("Audio generation failed: Text was empty after sanitization.");
  }

  const speechText = cleanText.slice(0, 2000);
  let base64Audio: string | null = null;

  // 3. Try Gemini TTS
  try {
      const aiClient = getAI();
      if (!aiClient) throw new Error("Gemini API Key missing");

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
      
      base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

  } catch (geminiError) {
      console.warn("Gemini TTS Failed, trying OpenAI...", geminiError);

      // 4. Try OpenAI TTS
      try {
          base64Audio = await generateAudioWithOpenAI(speechText);
      } catch (openAiError) {
          console.error("OpenAI TTS Failed", openAiError);
      }
  }

  // 5. Handle Result
  if (base64Audio) {
      audioMemoryCache.set(cacheKey, base64Audio);

      if (isSupabaseConfigured()) {
          supabase!.from('ai_audio_cache')
              .upsert({ text_hash: cacheKey, audio_data: base64Audio }, { onConflict: 'text_hash' })
              .then(() => {});
      }

      return { audioData: base64Audio };
  } else {
      // 6. Complete Failure -> Throw Error (App.tsx triggers Device TTS)
      throw new Error("Both AI TTS services failed.");
  }
};