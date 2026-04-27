import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, ShieldCheck, Users, Globe } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-900">{t.about}</h1>
        <p className="text-xl text-emerald-700 leading-relaxed">
          Smart Agriculture Advisory Platform is a next-generation digital ecosystem designed to bridge the gap between traditional farming and modern technology.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <Sprout className="text-emerald-600" /> Our Mission
          </h2>
          <p className="text-emerald-700 leading-relaxed">
            To empower every farmer with data-driven insights and immediate access to agricultural expertise, ensuring sustainable farming practices and food security for all.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <Globe className="text-emerald-600" /> Localized Support
          </h2>
          <p className="text-emerald-700 leading-relaxed">
            We understand that agriculture is deeply rooted in local culture. That's why we support multiple regional languages including Hindi and Marathi to reach every corner of the farming community.
          </p>
        </div>
      </div>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-emerald-900 text-center">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Submit Data", desc: "Farmers provide details about their crop, soil, and local environment." },
            { step: "2", title: "AI Analysis", desc: "Our Gemini-powered AI analyzes the data to provide instant advisory and risk scores." },
            { step: "3", title: "Expert Confirmation", desc: "Verified agricultural scientists review complex cases and provide professional guidance." },
            { step: "4", title: "Community Growth", desc: "A thriving forum where knowledge is shared and top contributors are rewarded." },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900 mb-1">{item.title}</h3>
                <p className="text-emerald-700">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
