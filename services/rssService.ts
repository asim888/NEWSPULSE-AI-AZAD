import { Category, Article } from '../types';
import { RSS_FEEDS } from '../constants';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const CACHE_PREFIX = 'news_pulse_cache_';
// Cache set to 30 mins for faster breaking news updates
const CACHE_DURATION = 30 * 60 * 1000; 

// Helper to generate a stable ID
const generateId = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'rss_' + Math.abs(hash).toString(36);
};

export const fetchNewsForCategory = async (category: Category): Promise<Article[]> => {
    
    // --- AZAD STUDIO (Fetch from Supabase Telegram Table) ---
    if (category === Category.AZAD_STUDIO) {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase!
                    .from('telegram_posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(15);
                
                if (data && !error) {
                    return data.map((post: any) => ({
                        id: `tg_${post.id}`,
                        title: post.message ? post.message.split('\n')[0].substring(0, 60) + "..." : "Studio Update",
                        source: 'Azad Studio Telegram',
                        timestamp: new Date(post.created_at).toLocaleDateString(),
                        description: post.message,
                        category: Category.AZAD_STUDIO,
                        url: '#',
                        imageUrl: post.media_url,
                        descriptionRomanUrdu: post.message
                    }));
                }
            } catch (e) {
                console.warn("Failed to fetch Telegram posts", e);
            }
        }
        return []; 
    }

    // --- STANDARD RSS CATEGORIES ---

    // 1. GLOBAL CACHE (Supabase)
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase!
                .from('rss_feed_cache')
                .select('*')
                .eq('category', category)
                .single();

            if (data && !error) {
                const lastUpdate = new Date(data.updated_at).getTime();
                const isFresh = (Date.now() - lastUpdate) < CACHE_DURATION;
                
                if (isFresh && data.articles && data.articles.length > 0) {
                    return data.articles;
                }
            }
        } catch (e) {
            console.warn(`Supabase RSS cache check failed for ${category}`, e);
        }
    }

    // 2. Local Fallback Cache
    const cacheKey = CACHE_PREFIX + category;
    const cachedData = localStorage.getItem(cacheKey);
    let cachedArticles: Article[] = [];
    
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                return parsed.articles;
            }
            cachedArticles = parsed.articles; // Keep as stale fallback
        } catch (e) {
            console.error("Cache parse error", e);
        }
    }

    // 3. Fetch from Live RSS via Proxy
    const feedUrls = RSS_FEEDS[category];
    if (!feedUrls || feedUrls.length === 0) return [];

    const fetchPromises = feedUrls.map(async (url) => {
        const proxies = [
            { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' },
            { url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, type: 'text' },
            { url: `https://corsproxy.io/?${encodeURIComponent(url)}`, type: 'text' },
            { url: `https://thingproxy.freeboard.io/fetch/${url}`, type: 'text' }
        ];

        for (const proxy of proxies) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); 

                const response = await fetch(proxy.url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`Proxy status ${response.status}`);

                let rssContent = "";
                if (proxy.type === 'json') {
                    const data = await response.json();
                    rssContent = data.contents;
                } else {
                    rssContent = await response.text();
                }

                if (!rssContent) continue;

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(rssContent, "text/xml");
                if (xmlDoc.querySelector("parsererror")) continue;

                const items = xmlDoc.querySelectorAll("item");
                if (items.length === 0) continue;

                const sourceName = new URL(url).hostname.replace('www.', '').replace('feeds.', '').split('.')[0].toUpperCase();

                return Array.from(items).map(item => {
                    const title = item.querySelector("title")?.textContent || "No Title";
                    const link = item.querySelector("link")?.textContent || "";
                    const pubDate = item.querySelector("pubDate")?.textContent || "";
                    const rawDescription = item.querySelector("description")?.textContent || "";
                    
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = rawDescription;
                    const cleanDescription = tempDiv.textContent?.trim().substring(0, 200) + "..." || "";

                    let imageUrl = '';
                    const mediaContent = item.getElementsByTagName("media:content")[0];
                    if (mediaContent) imageUrl = mediaContent.getAttribute("url") || '';
                    if (!imageUrl) {
                        const imgMatch = rawDescription.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) imageUrl = imgMatch[1];
                    }

                    return {
                        id: generateId(link),
                        title: title,
                        source: sourceName,
                        timestamp: pubDate ? new Date(pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
                        description: cleanDescription,
                        category: category,
                        url: link,
                        imageUrl: imageUrl 
                    };
                });
            } catch (e) {
               // Ignore and try next proxy
            }
        }
        return [];
    });

    const results = await Promise.all(fetchPromises);
    const allArticles = results.flat();

    const seenTitles = new Set();
    const uniqueArticles = allArticles.filter(article => {
        const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seenTitles.has(normalizedTitle)) return false;
        seenTitles.add(normalizedTitle);
        return true;
    });

    if (uniqueArticles.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            articles: uniqueArticles
        }));

        if (isSupabaseConfigured()) {
            supabase!.from('rss_feed_cache')
                .upsert({ 
                    category: category, 
                    articles: uniqueArticles,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'category' })
                .then(({ error }) => {
                    if (error) console.error(`[Supabase RSS] Failed update`, error);
                });
        }

        return uniqueArticles;
    }

    if (cachedArticles.length > 0) {
        return cachedArticles;
    }

    return [];
};