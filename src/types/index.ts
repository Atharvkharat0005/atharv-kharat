export type UserRole = 'farmer' | 'expert';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  expertise?: string;
  phoneNumber?: string;
  reputation: number;
  answersCount: number;
  isVerified: boolean;
  photoURL?: string;
}

export interface Advisory {
  id: string;
  userId: string;
  cropName: string;
  soilType: string;
  fieldSize: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  location: string;
  fertilizerRec: string;
  irrigationRec: string;
  pestAdvice: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReason: string;
  createdAt: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  cropName: string;
  problem: string;
  location: string;
  imageUrl?: string;
  aiDiagnosis?: string;
  aiConfidence?: number;
  bestAnswerId?: string;
  createdAt: any;
}

export interface Answer {
  id: string;
  postId: string;
  expertId: string;
  expertName: string;
  diagnosis: string;
  treatment: string;
  pesticide: string;
  prevention: string;
  isVerifiedExpert: boolean;
  createdAt: any;
}

export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    title: "Smart Agriculture Advisory Platform",
    home: "Home",
    about: "About",
    dashboard: "Dashboard",
    advisory: "Crop Advisory",
    risk: "Risk Analysis",
    community: "Community",
    leaderboard: "Leaderboard",
    profile: "Profile",
    login: "Login",
    logout: "Logout",
    farmer: "Farmer",
    expert: "Expert",
    cropName: "Crop Name",
    soilType: "Soil Type",
    fieldSize: "Field Size",
    temperature: "Temperature",
    humidity: "Humidity",
    rainfall: "Rainfall",
    location: "Location",
    getAdvisory: "Get Advisory",
    fertilizerRec: "Fertilizer Recommendation",
    irrigationRec: "Irrigation Recommendation",
    pestAdvice: "Pest Prevention Advice",
    riskScore: "Crop Risk Score",
    riskLevel: "Risk Level",
    reason: "Reason",
    listen: "Listen to Advisory",
    postProblem: "Post a Problem",
    bestAnswer: "Best Suggestion Selected",
    verified: "Verified Agricultural Scientist",
    points: "Expert Points",
    topExperts: "Top Experts This Month",
    diagnosis: "Disease Diagnosis",
    treatment: "Treatment",
    pesticide: "Pesticide Recommendations",
    prevention: "Prevention Methods",
    possibleDisease: "Possible Disease",
    confidence: "Confidence",
    submit: "Submit",
    loading: "Loading...",
    noData: "No data available",
    welcome: "Welcome to Smart Agri Advisory",
    heroDesc: "Empowering farmers with AI-driven insights and expert community support.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    diseaseDetection: "Disease Detection",
    scanCrop: "Scan Your Crop",
    scanDesc: "Upload a photo of your crop to detect diseases and get instant solutions.",
    uploadPhoto: "Upload Photo",
    analyzing: "Analyzing Image...",
    solution: "Instant Solution",
    preventionLong: "Long-term Prevention",
    callExpert: "Listen to Solution",
  },
  hi: {
    title: "स्मार्ट कृषि सलाहकार मंच",
    home: "होम",
    about: "हमारे बारे में",
    dashboard: "डैशबोर्ड",
    advisory: "फसल सलाह",
    risk: "जोखिम विश्लेषण",
    community: "समुदाय",
    leaderboard: "लीडरबोर्ड",
    profile: "प्रोफ़ाइल",
    login: "लॉगिन",
    logout: "लॉगआउट",
    farmer: "किसान",
    expert: "विशेषज्ञ",
    cropName: "फसल का नाम",
    soilType: "मिट्टी का प्रकार",
    fieldSize: "खेत का आकार",
    temperature: "तापमान",
    humidity: "नमी",
    rainfall: "वर्षा",
    location: "स्थान",
    getAdvisory: "सलाह प्राप्त करें",
    fertilizerRec: "उर्वरक सिफारिश",
    irrigationRec: "सिंचाई सिफारिश",
    pestAdvice: "कीट रोकथाम सलाह",
    riskScore: "फसल जोखिम स्कोर",
    riskLevel: "जोखिम स्तर",
    reason: "कारण",
    listen: "सलाह सुनें",
    postProblem: "समस्या पोस्ट करें",
    bestAnswer: "सर्वश्रेष्ठ सुझाव चुना गया",
    verified: "सत्यापित कृषि वैज्ञानिक",
    points: "विशेषज्ञ अंक",
    topExperts: "इस महीने के शीर्ष विशेषज्ञ",
    diagnosis: "रोग निदान",
    treatment: "उपचार",
    pesticide: "कीटनाशक सिफारिशें",
    prevention: "रोकथाम के तरीके",
    possibleDisease: "संभावित रोग",
    confidence: "आत्मविश्वास",
    submit: "जमा करें",
    loading: "लोड हो रहा है...",
    noData: "कोई डेटा उपलब्ध नहीं है",
    welcome: "स्मार्ट कृषि सलाह में आपका स्वागत है",
    heroDesc: "एआई-संचालित अंतर्दृष्टि और विशेषज्ञ सामुदायिक सहायता के साथ किसानों को सशक्त बनाना।",
    getStarted: "शुरू करें",
    learnMore: "और जानें",
    diseaseDetection: "रोग का पता लगाना",
    scanCrop: "अपनी फसल को स्कैन करें",
    scanDesc: "बीमारियों का पता लगाने और तत्काल समाधान पाने के लिए अपनी फसल की फोटो अपलोड करें।",
    uploadPhoto: "फोटो अपलोड करें",
    analyzing: "छवि का विश्लेषण कर रहा है...",
    solution: "तत्काल समाधान",
    preventionLong: "दीर्घकालिक रोकथाम",
    callExpert: "समाधान सुनें",
  },
  mr: {
    title: "स्मार्ट कृषी सल्लागार व्यासपीठ",
    home: "होम",
    about: "आमच्याबद्दल",
    dashboard: "डॅशबोर्ड",
    advisory: "पीक सल्ला",
    risk: "जोखीम विश्लेषण",
    community: "समुदाय",
    leaderboard: "लीडरबोर्ड",
    profile: "प्रोफाइल",
    login: "लॉगिन",
    logout: "लॉगआउट",
    farmer: "शेतकरी",
    expert: "तज्ञ",
    cropName: "पिकाचे नाव",
    soilType: "मातीचा प्रकार",
    fieldSize: "क्षेत्राचा आकार",
    temperature: "तापमान",
    humidity: "आद्रता",
    rainfall: "पाऊस",
    location: "स्थान",
    getAdvisory: "सल्ला मिळवा",
    fertilizerRec: "खत शिफारस",
    irrigationRec: "सिंचन शिफारस",
    pestAdvice: "कीड प्रतिबंध सल्ला",
    riskScore: "पीक जोखीम धावसंख्या",
    riskLevel: "जोखीम पातळी",
    reason: "कारण",
    listen: "सल्ला ऐका",
    postProblem: "समस्या पोस्ट करा",
    bestAnswer: "सर्वोत्तम सूचना निवडली",
    verified: "सत्यापित कृषी शास्त्रज्ञ",
    points: "तज्ञ गुण",
    topExperts: "या महिन्यातील शीर्ष तज्ञ",
    diagnosis: "रोग निदान",
    treatment: "उपचार",
    pesticide: "कीटकनाशक शिफारसी",
    prevention: "प्रतिबंधात्मक पद्धती",
    possibleDisease: "संभाव्य रोग",
    confidence: "आत्मविश्वास",
    submit: "सबमिट करा",
    loading: "लोड होत आहे...",
    noData: "डेटा उपलब्ध नाही",
    welcome: "स्मार्ट कृषी सल्ला मध्ये आपले स्वागत आहे",
    heroDesc: "AI-चालित अंतर्दृष्टि आणि तज्ञ समुदाय समर्थनासह शेतकऱ्यांना सक्षम करणे.",
    getStarted: "सुरू करा",
    learnMore: "अधिक जाणून घ्या",
    diseaseDetection: "रोग शोधणे",
    scanCrop: "तुमचे पीक स्कॅन करा",
    scanDesc: "रोगांचा शोध घेण्यासाठी आणि त्वरित उपाय मिळवण्यासाठी तुमच्या पिकाचा फोटो अपलोड करा.",
    uploadPhoto: "फोटो अपलोड करा",
    analyzing: "प्रतिमेचे विश्लेषण करत आहे...",
    solution: "त्वरित उपाय",
    preventionLong: "दीर्घकालीन प्रतिबंध",
    callExpert: "उपाय ऐका",
  }
};
