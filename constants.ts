import { Category, Article, TeamMember } from './types';

// Images
export const LOGO_URL = "https://i.postimg.cc/9FT5FFtX/logo.png";
export const ASSET_LOGO_URL = "https://i.postimg.cc/JzFKvjvF/assets.png";
export const FALLBACK_ARTICLE_IMAGE = "https://i.postimg.cc/hj1513Lj/c467305d-1093-458d-8281-26769fe9af73.jpg";
export const IMAGE_ABU_AIMAL = "https://i.postimg.cc/KvskFffK/Abu_Aimal.jpg";
export const IMAGE_AIMAL_AKRAM = "https://i.postimg.cc/7Z264kfr/Aimal_Akram.jpg";
export const SUBSCRIPTION_QR_URL = "https://i.postimg.cc/Dfjhmvgg/90bb0209-8fee-4249-b708-6eeb97e05570.jpg";

export const APP_NAME = "News Pulse AI";
export const TAGLINE = "Breaking language barriers with AI-powered news translation and text-to-speech.";
export const ATTRIBUTION = "By Abu Aimal, Aimal Akram & Azad Studio";

export const TEAM: TeamMember[] = [
  {
    name: "Abu Aimal",
    role: "Founder",
    bio: "Founder, Azad Studio & Social Activist. Known for his fearless reporting and dedication to grassroots issues, he uses media as a tool for social change.",
    image: IMAGE_ABU_AIMAL
  },
  {
    name: "Aimal Akram",
    role: "Director & Chief Editor",
    bio: "Director & Chief Editor, Azad Studio. With a sharp editorial vision and strong leadership, he oversees content creation and strategy.",
    image: IMAGE_AIMAL_AKRAM
  }
];

// Expanded RSS Feed Sources
export const RSS_FEEDS: Record<Category, string[]> = {
  [Category.AZAD_STUDIO]: [], // Handled separately via static data or Telegram
  [Category.FOUNDERS]: [],    // Handled separately as a static page
  [Category.HYDERABAD]: [
    'https://www.thehindu.com/news/cities/Hyderabad/feeder/default.rss',
    'https://telanganatoday.com/hyderabad/feed',
    'https://www.siasat.com/hyderabad/feed/'
  ],
  [Category.TELANGANA]: [
    'https://www.thehindu.com/news/telangana/feeder/default.rss',
    'https://telanganatoday.com/telangana/feed',
    'https://www.siasat.com/telangana/feed/'
  ],
  [Category.INDIA]: [
    'https://www.ndtv.com/news/national/feeder/default.rss',
    'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
    'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    'https://www.tribuneindia.com/rss/feed/nation'
  ],
  [Category.INTERNATIONAL]: [
    'https://www.ndtv.com/news/international/feeder/default.rss',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://www.theguardian.com/world/rss'
  ],
  [Category.SPORTS]: [
    'https://www.thehindu.com/sport/feeder/default.rss',
    'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
    'https://sports.ndtv.com/rss/all'
  ]
};

// Fallback/Initial Data to simulate "Smart Fetching" from DB/RSS
// DUPLICATED AND VARIED TO ENSURE 10 ITEMS PER SECTION
const generateFallback = (prefix: string, cat: Category, baseTitle: string, count: number) => {
    return Array.from({length: count}).map((_, i) => ({
        id: `${prefix}${i+1}`,
        title: `${baseTitle} - Update ${i+1}`,
        source: 'News Archive',
        timestamp: `${i+2} hours ago`,
        description: `This is a placeholder description for article ${i+1} in the ${cat} category. It ensures the grid is never empty even if the RSS feed is unreachable.`,
        descriptionRomanUrdu: `Yeh ${cat} category mein article ${i+1} ke liye aik misali matan hai.`,
        category: cat,
        url: '#',
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`
    }));
};

export const FALLBACK_NEWS: Article[] = [
  // --- HYDERABAD ---
  {
    id: 'h1',
    title: 'Hyderabad Metro Expansion Plans Approved',
    source: 'The Hindu',
    timestamp: '2 hours ago',
    description: 'The state government has given the green light for the second phase of the Hyderabad Metro Rail project, connecting the old city to the airport.',
    summaryShort: 'Hyderabad Metro Phase 2 approved by state government. The project will effectively connect the Old City to Shamshabad Airport, easing traffic congestion.',
    descriptionRomanUrdu: 'Riyasati hukumat ne Hyderabad Metro Rail project ke dusre marhale ki manzoori de di hai, jo purane sheher ko airport se jode ga.',
    descriptionUrdu: 'ریاستی حکومت نے حیدرآباد میٹرو ریل پروجیکٹ کے دوسرے مرحلے کی منظوری دے دی ہے، جو پرانے شہر کو ہوائی اڈے سے جوڑے گا۔',
    descriptionHindi: 'राज्य सरकार ने हैदराबाद मेट्रो रेल परियोजना के दूसरे चरण को हरी झंडी दे दी है, जो पुराने शहर को हवाई अड्डे से जोड़ेगी।',
    descriptionTelugu: 'పాతబస్తీని విమానాశ్రయంతో అనుసంధానించే హైదరాబాద్ మెట్రో రైలు ప్రాజెక్టు రెండో దశకు రాష్ట్ర ప్రభుత్వం పచ్చజెండా ఊపింది.',
    category: Category.HYDERABAD,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=1'
  },
  {
    id: 'h2',
    title: 'Traffic Restrictions in Jubilee Hills Today',
    source: 'Siasat',
    timestamp: '4 hours ago',
    description: 'Hyderabad Traffic Police have issued an advisory regarding traffic diversions in Jubilee Hills due to ongoing flyover construction work.',
    summaryShort: 'Traffic diversions announced in Jubilee Hills for flyover construction. Commuters advised to take alternate routes to avoid congestion.',
    descriptionRomanUrdu: 'Hyderabad Traffic Police ne Jubilee Hills mein flyover ki tameer ki wajah se traffic ke rukh modne ke hawalay se advisory jari ki hai.',
    category: Category.HYDERABAD,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=12'
  },
  {
    id: 'h3',
    title: 'Historic Charminar Restoration Begins',
    source: 'Deccan Chronicle',
    timestamp: '6 hours ago',
    description: 'The Archaeological Survey of India (ASI) has commenced a major restoration project to preserve the intricate stucco work of the Charminar.',
    summaryShort: 'ASI begins major restoration of Charminar to preserve its historic stucco work. The project aims to protect the monument for future generations.',
    descriptionRomanUrdu: 'Archaeological Survey of India ne Charminar ke naqsh-o-nigaar ko mehfooz rakhne ke liye ek bada bahali ka kaam shuru kiya hai.',
    category: Category.HYDERABAD,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=13'
  },
  {
    id: 'h4',
    title: 'New IT Park Announced for Kompally',
    source: 'Telangana Today',
    timestamp: '8 hours ago',
    description: 'To decentralize the IT sector, the government has announced a new IT park in Kompally, expected to generate 50,000 jobs.',
    summaryShort: 'Government announces new IT park in Kompally to decentralize growth. The project is expected to create 50,000 new jobs in North Hyderabad.',
    descriptionRomanUrdu: 'IT sector ko phelaane ke liye, hukumat ne Kompally mein naye IT park ka elaan kiya hai, jis se 50,000 naukriyan paida hone ki umeed hai.',
    category: Category.HYDERABAD,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=14'
  },
  ...generateFallback('h_extra_', Category.HYDERABAD, 'Local Hyderabad News', 6),

  // --- TELANGANA ---
  {
    id: 't1',
    title: 'Telangana Tech Summit 2025 Announced',
    source: 'Telangana Today',
    timestamp: '4 hours ago',
    description: 'Hyderabad is set to host the largest AI and Robotics summit in South Asia next month, attracting global investors.',
    summaryShort: 'Hyderabad to host South Asia’s largest AI & Robotics summit next month. The event aims to attract major global investors to Telangana.',
    descriptionRomanUrdu: 'Hyderabad agle mahine Junoobi Asia ki sab se badi AI aur Robotics summit ki mezbaani kare ga, jis mein almi sarmayakaron ki shirkat mutawaqqa hai.',
    descriptionUrdu: 'حیدرآباد اگلے ماہ جنوبی ایشیا کی سب سے بڑی اے آئی اور روبوٹکس سمٹ کی میزبانی کرے گا، جس میں عالمی سرمایہ کاروں کی شرکت متوقع ہے۔',
    descriptionHindi: 'हैदराबाद अगले महीने दक्षिण एशिया के सबसे बड़े एआई और रोबोटिक्स शिखर सम्मेलन की मेजबानी करने के लिए तैयार है, जो वैश्विक निवेशकों को आकर्षित करेगा।',
    descriptionTelugu: 'హైదరాబాద్ వచ్చే నెలలో దక్షిణాసియాలో అతిపెద్ద ఏఐ మరియు రోబోటిక్స్ సమ్మిట్‌కు ఆతిథ్యం ఇవ్వనుంది, ఇది ప్రపంచ పెట్టుబడిదారులను ఆకర్షిస్తుంది.',
    category: Category.TELANGANA,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=2'
  },
  {
    id: 't2',
    title: 'Farmers Receive Rythu Bandhu Aid',
    source: 'The Hindu',
    timestamp: '1 day ago',
    description: 'The state government has released the latest installment of Rythu Bandhu investment support to over 60 lakh farmers across the state.',
    summaryShort: 'Rythu Bandhu funds released to 60 lakh farmers. The scheme provides investment support for the upcoming agricultural season.',
    descriptionRomanUrdu: 'Riyasati hukumat ne Rythu Bandhu ki taza qist 60 lakh se zayed kisanon ke liye jari kar di hai.',
    category: Category.TELANGANA,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=22'
  },
  ...generateFallback('t_extra_', Category.TELANGANA, 'State Development Update', 8),

  // --- INDIA ---
  {
    id: 'i1',
    title: 'India Launches New Solar Mission',
    source: 'NDTV',
    timestamp: '30 mins ago',
    description: 'ISRO successfully launches its advanced solar observatory, aiming to study solar flares and their impact on Earths atmosphere.',
    summaryShort: 'ISRO launches advanced solar observatory to study solar flares. The mission aims to understand the impact of solar activity on Earth’s atmosphere.',
    descriptionRomanUrdu: 'ISRO ne kamyabi ke saath apni advanced solar observatory launch kar di hai, jiska maqsad sooraj ki lahron aur zameen ke mahaul par unke asraat ka mutala karna hai.',
    descriptionUrdu: 'اسرو نے کامیابی کے ساتھ اپنی جدید سولر آبزرویٹری لانچ کر دی ہے، جس کا مقصد سورج کی لہروں اور زمین کے ماحول پر ان کے اثرات کا مطالعہ کرنا ہے۔',
    descriptionHindi: 'इसरो ने अपनी उन्नत सौर वेधशाला को सफलतापूर्वक लॉन्च किया, जिसका उद्देश्य सौर फ्लेयर्स और पृथ्वी के वायुमंडल पर उनके प्रभाव का अध्ययन करना है।',
    descriptionTelugu: 'సౌర మంటలు మరియు భూమి యొక్క వాతావరణంపై వాటి ప్రభావాన్ని అధ్యయనం చేసే లక్ష్యంతో ఇస్రో తన అధునాతన సోలార్ అబ్జర్వేటరీని విజయవంతంగా ప్రయోగించింది.',
    category: Category.INDIA,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=3'
  },
  {
    id: 'i2',
    title: 'Digital Rupee Pilot Expands',
    source: 'Times of India',
    timestamp: '5 hours ago',
    description: 'RBI announces the expansion of the Digital Rupee pilot project to five more cities, aiming to modernize payment systems.',
    summaryShort: 'RBI expands Digital Rupee pilot to 5 more cities. The move aims to test the currency in wider retail scenarios.',
    descriptionRomanUrdu: 'RBI ne Digital Rupee pilot project ko mazeed paanch shehron tak phelane ka elaan kiya hai.',
    category: Category.INDIA,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=32'
  },
  ...generateFallback('i_extra_', Category.INDIA, 'National News Brief', 8),

  // --- INTERNATIONAL ---
  {
    id: 'w1',
    title: 'Global Climate Accord Reached',
    source: 'BBC',
    timestamp: '1 hour ago',
    description: 'World leaders have signed a historic agreement to reduce carbon emissions by 50% within the next decade.',
    summaryShort: 'Historic global climate agreement signed to cut carbon emissions by 50% in 10 years. World leaders unite for a sustainable future.',
    descriptionRomanUrdu: 'Dunya ke rehnumao ne aane wali dahai mein carbon kharij hone ki miqdar ko 50% tak kam karne ke tareekhi muahiday par dastakhat kiye hain.',
    descriptionUrdu: 'دنیا کے رہنماؤں نے آنے والی دہائی میں کاربن کے اخراج کو 50 فیصد تک کم کرنے کے تاریخی معاہدے پر دستخط کیے ہیں۔',
    descriptionHindi: 'विश्व नेताओं ने अगले दशक के भीतर कार्बन उत्सर्जन को 50% तक कम करने के लिए एक ऐतिहासिक समझौते पर हस्ताक्षर किए हैं।',
    descriptionTelugu: 'రాబోయే దశాబ్దంలో కర్బన ఉద్గారాలను 50% తగ్గించే చారిత్రక ఒప్పందంపై ప్రపంచ నాయకులు సంతకం చేశారు.',
    category: Category.INTERNATIONAL,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=4'
  },
  ...generateFallback('w_extra_', Category.INTERNATIONAL, 'Global Headlines', 9),

  // --- SPORTS ---
  {
    id: 's1',
    title: 'India Wins Thriller Against Australia',
    source: 'ESPN Cricinfo',
    timestamp: '15 mins ago',
    description: 'In a last-over finish, Team India secured a victory by 2 wickets in the opening T20 match of the series.',
    summaryShort: 'Team India wins T20 opener against Australia by 2 wickets in a last-over thriller. A spectacular start to the series.',
    descriptionRomanUrdu: 'Team India ne series ke pehle T20 match mein aakhri over mein 2 wickets se shandaar jeet hasil ki.',
    descriptionUrdu: 'ٹیم انڈیا نے سیریز کے پہلے ٹی 20 میچ میں آخری اوور میں 2 وکٹوں سے شاندار جیت حاصل کی۔',
    descriptionHindi: 'सीरीज के पहले टी20 मैच में टीम इंडिया ने आखिरी ओवर में 2 विकेट से रोमांचक जीत दर्ज की।',
    descriptionTelugu: 'సిరీస్‌లోని ఆరంభ టి20 మ్యాచ్‌లో టీమ్ ఇండియా చివరి ఓవర్‌లో 2 వికెట్ల తేడాతో విజయం సాధించింది.',
    category: Category.SPORTS,
    url: '#',
    imageUrl: 'https://picsum.photos/800/600?random=5'
  },
  ...generateFallback('s_extra_', Category.SPORTS, 'Sports Update', 9),

  // --- AZAD STUDIO ---
  {
    id: 'az1',
    title: 'Azad Studio: New Documentary Release',
    source: 'Azad Studio Updates',
    timestamp: 'Just Now',
    description: 'Our latest documentary "Voices of the Silent" premieres this Friday. Join us for the live screening event.',
    summaryShort: 'Azad Studio premieres "Voices of the Silent" documentary this Friday. Join the live screening to witness this impactful story.',
    descriptionRomanUrdu: 'Hamari nayi documentary "Voices of the Silent" is Jumay ko release ho rahi hai. Live screening event mein humare saath shamil hon.',
    descriptionUrdu: 'ہماری نئی دستاویزی فلم "وائسز آف دی سائلنٹ" اس جمعہ کو ریلیز ہو رہی ہے۔ لائیو اسکریننگ ایونٹ میں ہمارے ساتھ شامل ہوں۔',
    descriptionHindi: 'हमारी नवीनतम वृत्तचित्र "वॉयस ऑफ द साइलेंट" इस शुक्रवार को रिलीज हो रही है। लाइव स्क्रीनिंग इवेंट में हमारे साथ शामिल हों।',
    descriptionTelugu: 'మా తాజా డాక్యుమెంటరీ "వాయిస్ ఆఫ్ ది సైలెంట్" ఈ శుక్రవారం ప్రీమియర్ అవుతుంది. లైవ్ స్క్రీనింగ్ ఈవెంట్ కోసం మాతో చేరండి.',
    category: Category.AZAD_STUDIO,
    url: '#',
    imageUrl: ASSET_LOGO_URL
  },
  ...generateFallback('az_extra_', Category.AZAD_STUDIO, 'Studio Announcement', 9)
];