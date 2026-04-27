import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { diagnoseImage, generateVoiceAdvisory } from '../services/gemini';
import { Camera, Upload, Loader2, Volume2, CheckCircle2, AlertCircle, ShieldCheck, ChevronLeft, Globe, Sprout, Search, Phone, X, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const DiseaseDetection: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    disease: string;
    confidence: number;
    treatment: string;
    prevention: string;
  } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isCallingExpert, setIsCallingExpert] = useState(false);
  const [isTwilioCalling, setIsTwilioCalling] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      if (!process.env.GEMINI_API_KEY) {
        // @ts-ignore
        if (window.aistudio) {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } else {
          setHasApiKey(false);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  React.useEffect(() => {
    let interval: any;
    if (isCallConnected) {
      interval = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [location, setLocation] = useState<string>('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          setLocation(data.display_name || `${latitude}, ${longitude}`);
        } catch (error) {
          console.error("Location error:", error);
        } finally {
          setGettingLocation(false);
        }
      },
      () => setGettingLocation(false)
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        fetchLocation(); // Fetch location when image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !cropName) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const diagnosis = await diagnoseImage(base64Data, `${cropName} (Location: ${location})`);
      setResult(diagnosis);
      
      // Automatically trigger the call simulation
      setTimeout(() => {
        handleStartCall();
      }, 1000);
    } catch (error: any) {
      console.error("Diagnosis error:", error);
      if (error.message?.includes("API key is missing")) {
        setHasApiKey(false);
        alert("Gemini API key is missing. Please select an API key to continue.");
      } else {
        alert("Failed to analyze image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = () => {
    if (!result || isRinging || isCallConnected) return;
    setIsRinging(true);
  };

  const handleAcceptCall = async () => {
    setIsRinging(false);
    setIsCallConnected(true);
    setPlaying(true);
    setCallSeconds(0);
    
    const text = language === 'hi'
      ? `नमस्ते किसान भाई, आपकी ${cropName} की फसल में ${result?.disease} का पता चला है। इसका तुरंत समाधान यह है: ${result?.treatment}। भविष्य में इससे बचने के लिए: ${result?.prevention}। धन्यवाद।`
      : language === 'mr'
      ? `नमस्कार शेतकरी मित्रा, तुमच्या ${cropName} पिकात ${result?.disease} आढळला आहे. यावर त्वरित उपाय म्हणजे: ${result?.treatment}। भविष्यात हे टाळण्यासाठी: ${result?.prevention}। धन्यवाद।`
      : `Hello Farmer, your ${cropName} crop has been diagnosed with ${result?.disease}. The immediate solution is: ${result?.treatment}. For long-term prevention: ${result?.prevention}. Thank you.`;

    // If phone number is provided in profile, trigger real Twilio call
    if (profile?.phoneNumber) {
      setIsTwilioCalling(true);
      try {
        const response = await fetch('/api/make-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: profile.phoneNumber,
            message: text,
            language: language
          })
        });
        const data = await response.json();
        if (data.success) {
          console.log("Twilio call initiated:", data.callSid);
        } else {
          console.error("Twilio call failed:", data.error);
          // Show a more helpful alert for verification errors
          if (data.code === 21210 || data.code === 21608) {
            alert(`Twilio Call Error: ${data.error}\n\nNote: The app will still play the solution through your browser speakers.`);
          }
        }
      } catch (error) {
        console.error("Twilio API error:", error);
      } finally {
        setIsTwilioCalling(false);
      }
    }

    // Always play browser audio as well (or as fallback)
    try {
      const audioUrl = await generateVoiceAdvisory(text, 'Kore');
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setPlaying(false);
          setIsCallConnected(false);
        };
        audio.play();
      } else {
        setPlaying(false);
        setIsCallConnected(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setPlaying(false);
      setIsCallConnected(false);
    }
  };

  const handleEndCall = () => {
    setPlaying(false);
    setIsRinging(false);
    setIsCallConnected(false);
    window.location.reload(); 
  };

  const handleCallExpert = () => {
    setIsCallingExpert(true);
    setTimeout(() => {
      setIsCallingExpert(false);
      alert(language === 'hi' ? "विशेषज्ञ अभी व्यस्त हैं। कृपया बाद में प्रयास करें।" : language === 'mr' ? "तज्ञ सध्या व्यस्त आहेत. कृपया नंतर प्रयत्न करा." : "Experts are currently busy. Please try again later.");
    }, 5000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline">
          <ChevronLeft size={20} /> {t.dashboard}
        </Link>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm font-medium">
          <Globe size={16} />
          {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'}
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">{t.diseaseDetection}</h1>
        <p className="text-emerald-600 text-lg">{t.scanDesc}</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Sprout size={16} className="text-emerald-600" /> {t.cropName}
              </label>
              <input 
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Tomato, Rice, Cotton"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-emerald-50/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Globe size={16} className="text-emerald-600" /> {t.location}
              </label>
              <div className="relative">
                <input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Fetching live location..."
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-emerald-50/30 pr-10"
                />
                <button 
                  onClick={fetchLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                >
                  {gettingLocation ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Camera size={16} className="text-emerald-600" /> {t.uploadPhoto}
              </label>
              <div className="relative group">
                <label className={`w-full aspect-video rounded-2xl border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${image ? 'border-emerald-500' : 'bg-emerald-50/30 hover:bg-emerald-50'}`}>
                  {image ? (
                    <img src={image} alt="Crop" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="text-emerald-600" size={24} />
                      </div>
                      <span className="text-emerald-600 font-bold block">Take Photo or Upload</span>
                      <span className="text-emerald-400 text-xs mt-1 block">Supports JPG, PNG</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {image && (
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 p-2 rounded-xl shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <AlertCircle size={20} />
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading || !image || !cropName}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? <><Loader2 className="animate-spin" /> {t.analyzing}</> : <><Search size={20} /> {t.scanCrop}</>}
            </button>

            {!hasApiKey && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-3 text-amber-800">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="font-bold">Gemini API Key Required</p>
                    <p className="opacity-80">To use AI analysis, you need to provide a Gemini API key. If you are in AI Studio, you can select one from the settings.</p>
                  </div>
                </div>
                {/* @ts-ignore */}
                {window.aistudio && (
                  <button 
                    onClick={handleOpenKeyDialog}
                    className="w-full bg-amber-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors"
                  >
                    Select API Key
                  </button>
                )}
                <p className="text-[10px] text-amber-600 opacity-60 text-center">
                  Note: If running locally, set GEMINI_API_KEY in your .env file.
                </p>
              </div>
            )}
          </div>

          <div className="bg-emerald-900 text-emerald-100 p-6 rounded-3xl shadow-xl overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" /> AI-Powered Accuracy
              </h3>
              <p className="text-sm opacity-80">Our advanced AI models analyze thousands of crop patterns to provide you with the most accurate diagnosis and treatment plans.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Sprout size={120} />
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                  <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <div className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Diagnosis Result</div>
                        <h2 className="text-3xl font-bold leading-tight">{result.disease}</h2>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-bold border border-white/20">
                        {result.confidence}% Match
                      </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                      <CheckCircle2 size={200} />
                    </div>
                  </div>

                  <div className="p-8 grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-900 font-bold">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        </div>
                        {t.solution}
                      </div>
                      <p className="text-emerald-700 text-sm leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
                        {result.treatment}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-900 font-bold">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShieldCheck size={18} className="text-blue-600" />
                        </div>
                        {t.preventionLong}
                      </div>
                      <p className="text-emerald-700 text-sm leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                        {result.prevention}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voice Assistant "Call" Section */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${playing ? 'bg-emerald-600 scale-110 shadow-xl shadow-emerald-200' : 'bg-emerald-200'}`}>
                      {playing ? (
                        <div className="flex gap-1 items-center">
                          {[1, 2, 3, 4].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [10, 30, 10] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                              className="w-1 bg-white rounded-full"
                            />
                          ))}
                        </div>
                      ) : (
                        <Volume2 size={40} className="text-emerald-600" />
                      )}
                    </div>
                    {playing && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-emerald-400 rounded-full -z-10"
                      />
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <h3 className="text-xl font-bold text-emerald-900">AI Voice Assistant</h3>
                    <p className="text-emerald-600">Get the solution explained in your language (English, Hindi, or Marathi).</p>
                    
                    {profile?.phoneNumber ? (
                      <div className="bg-emerald-100/50 px-4 py-2 rounded-xl border border-emerald-200 inline-block">
                        <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Calling to Registered Number</p>
                        <p className="text-emerald-900 font-medium">{profile.phoneNumber}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium italic">Update your phone number in profile for real calls.</p>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <button 
                        onClick={handleStartCall}
                        disabled={playing || isRinging || isCallConnected}
                        className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all ${playing ? 'bg-emerald-100 text-emerald-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'}`}
                      >
                        {playing ? 'In Call...' : <><Phone size={20} /> {profile?.phoneNumber ? 'Get Real Call' : 'Get Solution via Call'}</>}
                      </button>
                      
                      <button 
                        onClick={handleCallExpert}
                        className="px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Phone size={20} /> Call Expert
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] bg-white rounded-3xl border border-dashed border-emerald-200 flex flex-col items-center justify-center p-12 text-center space-y-6 shadow-sm">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Search className="text-emerald-200" size={48} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold text-emerald-900">Ready to Scan</h3>
                  <p className="text-emerald-600 mt-2">Upload a clear photo of the affected crop area. Our AI will analyze it and provide instant solutions in your language.</p>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm pt-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-square bg-emerald-50/50 rounded-2xl border border-emerald-100" />
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Phone Call Simulation */}
      <AnimatePresence>
        {(isRinging || isCallConnected) && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col"
          >
            {/* Call Header */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl relative">
                {isCallConnected && (
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-emerald-400 rounded-full"
                  />
                )}
                <Sprout size={64} className="relative z-10" />
              </div>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold">Smart Agri AI</h2>
                <p className="text-emerald-400 font-medium mt-1">
                  {isRinging ? 'Incoming Call...' : formatTime(callSeconds)}
                </p>
              </div>

              {isCallConnected && (
                <div className="flex gap-3 items-center pt-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [15, 40, 15] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1.5 bg-emerald-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="bg-slate-800/50 backdrop-blur-lg p-12 pb-20 rounded-t-[3rem]">
              {isRinging ? (
                <div className="flex justify-around items-center">
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={handleEndCall}
                      className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-all"
                    >
                      <PhoneOff size={32} />
                    </button>
                    <span className="text-sm font-medium text-slate-400">Decline</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={handleAcceptCall}
                      className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all animate-bounce"
                    >
                      <Phone size={32} />
                    </button>
                    <span className="text-sm font-medium text-slate-400">Accept</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { icon: <Volume2 />, label: 'Speaker' },
                      { icon: <X />, label: 'Mute' },
                      { icon: <Search />, label: 'Keypad' }
                    ].map((btn, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                          {btn.icon}
                        </div>
                        <span className="text-xs font-medium text-slate-400">{btn.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={handleEndCall}
                      className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-all"
                    >
                      <PhoneOff size={32} />
                    </button>
                    <span className="text-sm font-medium text-slate-400">End Call</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Call Overlay (Simulated) */}
      <AnimatePresence>
        {isCallingExpert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8"
          >
            <div className="text-center space-y-8 max-w-md w-full">
              <div className="relative mx-auto w-32 h-32">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-blue-400 rounded-full"
                />
                <div className="relative z-10 w-full h-full bg-blue-600 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
                  <img src="https://picsum.photos/seed/expert/200" alt="Expert" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold">Agri Expert</h2>
                <p className="text-blue-300 mt-2">Connecting to Senior Scientist...</p>
              </div>

              <div className="flex gap-2 items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>

              <button 
                onClick={() => setIsCallingExpert(false)}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-all mx-auto"
              >
                <PhoneOff size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiseaseDetection;
