import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Advisory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateVoiceAdvisory } from '../services/gemini';
import { Volume2, ChevronLeft, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import RiskChart from '../components/RiskChart';
import { motion } from 'motion/react';

const RiskAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchAdvisory = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'advisories', id));
        if (docSnap.exists()) {
          setAdvisory({ id: docSnap.id, ...docSnap.data() } as Advisory);
        }
      } catch (error) {
        console.error("Error fetching advisory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, [id]);

  const handleListen = async () => {
    if (!advisory || playing) return;
    setPlaying(true);
    try {
      const text = language === 'hi' 
        ? `नमस्ते किसान भाई। आपके ${advisory.cropName} के लिए सलाह: ${advisory.fertilizerRec}. सिंचाई: ${advisory.irrigationRec}. जोखिम स्तर: ${advisory.riskLevel}.`
        : language === 'mr'
        ? `नमस्कार शेतकरी मित्रा. तुमच्या ${advisory.cropName} पिकासाठी सल्ला: ${advisory.fertilizerRec}. सिंचन: ${advisory.irrigationRec}. जोखीम पातळी: ${advisory.riskLevel}.`
        : `Hello Farmer. Advisory for your ${advisory.cropName}: ${advisory.fertilizerRec}. Irrigation: ${advisory.irrigationRec}. Risk Level: ${advisory.riskLevel}.`;
      
      const audioUrl = await generateVoiceAdvisory(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlaying(false);
        audio.play();
      } else {
        setPlaying(false);
      }
    } catch (error) {
      console.error("Error playing voice advisory:", error);
      setPlaying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20">{t.loading}</div>;
  if (!advisory) return <div className="text-center py-20">{t.noData}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/dashboard" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline">
        <ChevronLeft size={20} /> Back to Dashboard
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Risk Score Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-xl font-bold text-emerald-900 mb-6">{t.riskScore}</h2>
          <RiskChart score={advisory.riskScore} label={advisory.riskLevel} />
          <div className={`mt-6 px-4 py-2 rounded-full font-bold text-sm ${
            advisory.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
            advisory.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {advisory.riskLevel} RISK
          </div>
          <p className="mt-4 text-sm text-emerald-600 italic">
            {advisory.riskReason}
          </p>
        </motion.div>

        {/* Advisory Details */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm space-y-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-emerald-900">{advisory.cropName}</h1>
                <p className="text-emerald-600">{advisory.location} • {advisory.soilType}</p>
              </div>
              <button 
                onClick={handleListen}
                disabled={playing}
                className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-200 transition-all disabled:opacity-50"
              >
                {playing ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                {t.listen}
              </button>
            </div>

            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">{t.fertilizerRec}</h3>
                  <p className="text-emerald-700 mt-1">{advisory.fertilizerRec}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">{t.irrigationRec}</h3>
                  <p className="text-emerald-700 mt-1">{advisory.irrigationRec}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">{t.pestAdvice}</h3>
                  <p className="text-emerald-700 mt-1">{advisory.pestAdvice}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-emerald-900 text-white rounded-3xl p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-300">Environmental Conditions</div>
              <div className="flex gap-6 mt-2">
                <div>
                  <span className="text-xs text-emerald-400 block">Temp</span>
                  <span className="font-bold">{advisory.temperature}°C</span>
                </div>
                <div>
                  <span className="text-xs text-emerald-400 block">Humidity</span>
                  <span className="font-bold">{advisory.humidity}%</span>
                </div>
                <div>
                  <span className="text-xs text-emerald-400 block">Rainfall</span>
                  <span className="font-bold">{advisory.rainfall}mm</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-emerald-300">Field Size</div>
              <div className="font-bold text-xl">{advisory.fieldSize}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
