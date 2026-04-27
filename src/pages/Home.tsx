import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, ShieldCheck, Users, PhoneCall, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const { profile, login } = useAuth();
  const { t } = useLanguage();

  const features = [
    { icon: Sprout, title: t.advisory, desc: "Get AI-powered recommendations for fertilizer, irrigation, and pests." },
    { icon: ShieldCheck, title: t.diseaseDetection, desc: t.scanDesc },
    { icon: Users, title: t.community, desc: "Connect with agricultural experts and fellow farmers." },
    { icon: PhoneCall, title: "Voice Advisory", desc: "Listen to advisory messages in your preferred language." },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-900 text-white px-8 py-20 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
            alt="Farm" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-3xl space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold leading-tight"
          >
            {t.welcome}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-emerald-100"
          >
            {t.heroDesc}
          </motion.p>
          
          {!profile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button 
                onClick={() => login('farmer')}
                className="bg-white text-emerald-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl flex items-center gap-2"
              >
                Join as {t.farmer} <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => login('expert')}
                className="bg-emerald-700 text-white border border-emerald-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl"
              >
                Join as {t.expert}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">{feature.title}</h3>
            <p className="text-emerald-700/70 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-3xl p-12 border border-emerald-100 shadow-sm">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-emerald-900 mb-2">10k+</div>
            <div className="text-emerald-600 font-medium">Farmers Empowered</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-900 mb-2">500+</div>
            <div className="text-emerald-600 font-medium">Verified Experts</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-900 mb-2">95%</div>
            <div className="text-emerald-600 font-medium">Advisory Accuracy</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
