import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, ShieldCheck, MessageSquare, Star, Award } from 'lucide-react';
import { motion } from 'motion/react';

const Leaderboard: React.FC = () => {
  const { t } = useLanguage();
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('reputation', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setExperts(snap.docs.map(doc => doc.data() as UserProfile));
      } catch (error) {
        console.error("Error fetching experts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  if (loading) return <div className="flex justify-center py-20">{t.loading}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-emerald-900">{t.topExperts}</h1>
        <p className="text-emerald-600">Recognizing the most helpful agricultural scientists in our community.</p>
      </header>

      <div className="grid gap-4">
        {experts.map((expert, idx) => (
          <motion.div 
            key={expert.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm flex items-center gap-6 ${
              idx === 0 ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <div className="w-12 h-12 flex items-center justify-center font-bold text-2xl text-emerald-300">
              {idx === 0 ? <Trophy className="text-amber-400" size={32} /> : idx + 1}
            </div>

            <div className="flex-1 flex items-center gap-4">
              {expert.photoURL ? (
                <img src={expert.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-emerald-100" />
              ) : (
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-xl">
                  {expert.displayName[0]}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-1">
                  {expert.displayName}
                  {expert.isVerified && <ShieldCheck size={18} className="text-blue-500" />}
                </h3>
                <p className="text-sm text-emerald-500">{expert.expertise || 'Agricultural Scientist'}</p>
              </div>
            </div>

            <div className="flex gap-8 text-center">
              <div>
                <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">Answers</div>
                <div className="flex items-center justify-center gap-1 text-emerald-900 font-bold">
                  <MessageSquare size={14} className="text-emerald-400" /> {expert.answersCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">Points</div>
                <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                  <Award size={14} /> {expert.reputation}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {experts.length === 0 && (
        <div className="text-center py-20 text-emerald-600">{t.noData}</div>
      )}
    </div>
  );
};

export default Leaderboard;
