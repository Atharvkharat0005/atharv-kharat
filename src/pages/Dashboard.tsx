import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Advisory, Post } from '../types';
import { Link } from 'react-router-dom';
import { Sprout, AlertTriangle, MessageSquare, Plus, ChevronRight, Trophy, Search, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import RiskChart from '../components/RiskChart';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      
      try {
        if (profile.role === 'farmer') {
          const advQuery = query(
            collection(db, 'advisories'),
            where('userId', '==', profile.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const advSnap = await getDocs(advQuery);
          setAdvisories(advSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advisory)));
        }

        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const postsSnap = await getDocs(postsQuery);
        setRecentPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (loading) return <div className="flex justify-center py-20">{t.loading}</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">
            {t.dashboard} - {profile?.displayName}
          </h1>
          <p className="text-emerald-600">{profile?.role === 'farmer' ? 'Farmer Dashboard' : 'Expert Dashboard'}</p>
        </div>
        <div className="flex gap-3">
          {profile?.role === 'farmer' && (
            <>
              <Link 
                to="/disease-detection" 
                className="bg-white text-emerald-600 border-2 border-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Camera size={20} /> {t.scanCrop}
              </Link>
              <Link 
                to="/advisory/new" 
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus size={20} /> {t.getAdvisory}
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {profile?.role === 'farmer' && (
            <section className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                  <Sprout className="text-emerald-600" /> Recent Advisories
                </h2>
              </div>
              
              {advisories.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {advisories.map((adv) => (
                    <Link 
                      key={adv.id} 
                      to={`/risk/${adv.id}`}
                      className="p-4 rounded-xl border border-emerald-50 hover:bg-emerald-50/50 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-emerald-900">{adv.cropName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          adv.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
                          adv.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {adv.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-emerald-600">{adv.location}</div>
                        <ChevronRight size={16} className="text-emerald-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-emerald-600 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-200">
                  {t.noData}
                </div>
              )}
            </section>
          )}

          <section className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                <MessageSquare className="text-emerald-600" /> Community Discussions
              </h2>
              <Link to="/community" className="text-emerald-600 text-sm font-bold hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`}
                  className="block p-4 rounded-xl border border-emerald-50 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex gap-4">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-emerald-900 truncate">{post.cropName}: {post.problem}</h3>
                      <p className="text-sm text-emerald-600 mt-1">{post.authorName} • {post.location}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {profile?.role === 'expert' && (
            <section className="bg-emerald-900 text-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-amber-400" /> Expert Stats
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200">Reputation Points</span>
                  <span className="text-2xl font-bold text-amber-400">{profile.reputation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200">Answers Given</span>
                  <span className="text-2xl font-bold">{profile.answersCount}</span>
                </div>
                {profile.isVerified && (
                  <div className="bg-emerald-800/50 p-3 rounded-lg border border-emerald-700 flex items-center gap-2 text-sm">
                    <ShieldCheck className="text-emerald-400" size={16} />
                    Verified Agricultural Scientist
                  </div>
                )}
              </div>
            </section>
          )}

          {advisories.length > 0 && (
            <section className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <h2 className="text-lg font-bold text-emerald-900 mb-4">Latest Risk Score</h2>
              <RiskChart score={advisories[0].riskScore} label={t.riskLevel} />
              <p className="text-sm text-emerald-600 mt-4 text-center italic">
                "{advisories[0].riskReason}"
              </p>
            </section>
          )}

          <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h2 className="font-bold text-emerald-900 mb-4">Quick Tips</h2>
            <ul className="space-y-3 text-sm text-emerald-700">
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                Rotate crops to maintain soil fertility.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                Use organic mulch to retain soil moisture.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                Monitor pests early in the morning.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Dashboard;
