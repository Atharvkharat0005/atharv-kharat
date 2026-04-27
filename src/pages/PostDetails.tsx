import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, Answer, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, MapPin, ShieldCheck, CheckCircle2, Trophy, Loader2, MessageSquare, Plus, AlertTriangle, Sprout } from 'lucide-react';
import { motion } from 'motion/react';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const [newAnswer, setNewAnswer] = useState({
    diagnosis: '',
    treatment: '',
    pesticide: '',
    prevention: '',
  });

  useEffect(() => {
    fetchPostAndAnswers();
  }, [id]);

  const fetchPostAndAnswers = async () => {
    if (!id) return;
    try {
      const postSnap = await getDoc(doc(db, 'posts', id));
      if (postSnap.exists()) {
        setPost({ id: postSnap.id, ...postSnap.data() } as Post);
      }

      const ansQuery = query(
        collection(db, 'posts', id, 'answers'),
        orderBy('createdAt', 'desc')
      );
      const ansSnap = await getDocs(ansQuery);
      setAnswers(ansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Answer)));
    } catch (error) {
      console.error("Error fetching post details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !id) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'posts', id, 'answers'), {
        postId: id,
        expertId: profile.uid,
        expertName: profile.displayName,
        isVerifiedExpert: profile.isVerified,
        ...newAnswer,
        createdAt: serverTimestamp(),
      });

      // Update expert stats
      await updateDoc(doc(db, 'users', profile.uid), {
        answersCount: increment(1)
      });

      setNewAnswer({ diagnosis: '', treatment: '', pesticide: '', prevention: '' });
      setShowAnswerForm(false);
      fetchPostAndAnswers();
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectBest = async (answer: Answer) => {
    if (!profile || !post || profile.uid !== post.authorId || post.bestAnswerId) return;

    try {
      await updateDoc(doc(db, 'posts', post.id), {
        bestAnswerId: answer.id
      });

      // Reward expert
      await updateDoc(doc(db, 'users', answer.expertId), {
        reputation: increment(50)
      });

      fetchPostAndAnswers();
    } catch (error) {
      console.error("Error selecting best answer:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-20">{t.loading}</div>;
  if (!post) return <div className="text-center py-20">{t.noData}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/community" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline">
        <ChevronLeft size={20} /> Back to Community
      </Link>

      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="w-full h-96 object-cover" referrerPolicy="no-referrer" />
        )}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.cropName}
                </span>
                <span className="text-xs text-emerald-400">
                  {new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-emerald-900">{post.problem}</h1>
              <div className="flex items-center gap-2 text-emerald-600 mt-2">
                <MapPin size={16} /> {post.location}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-400">Posted by</div>
              <div className="font-bold text-emerald-900">{post.authorName}</div>
            </div>
          </div>

          {post.aiDiagnosis && (
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3">
                <Sprout size={20} /> AI Pre-Diagnosis
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-emerald-600">{t.possibleDisease}</div>
                  <div className="text-xl font-bold text-emerald-900">{post.aiDiagnosis}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-600">{t.confidence}</div>
                  <div className="text-xl font-bold text-emerald-900">{post.aiConfidence}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <MessageSquare className="text-emerald-600" /> Expert Advice ({answers.length})
          </h2>
          {profile?.role === 'expert' && !showAnswerForm && (
            <button 
              onClick={() => setShowAnswerForm(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Give Advice
            </button>
          )}
        </div>

        {showAnswerForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-md space-y-6"
          >
            <h3 className="text-xl font-bold text-emerald-900">Your Expert Recommendation</h3>
            <form onSubmit={handleAnswerSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-900">{t.diagnosis}</label>
                  <input 
                    required
                    value={newAnswer.diagnosis}
                    onChange={(e) => setNewAnswer(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-900">{t.pesticide}</label>
                  <input 
                    required
                    value={newAnswer.pesticide}
                    onChange={(e) => setNewAnswer(prev => ({ ...prev, pesticide: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-900">{t.treatment}</label>
                <textarea 
                  required
                  rows={3}
                  value={newAnswer.treatment}
                  onChange={(e) => setNewAnswer(prev => ({ ...prev, treatment: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-900">{t.prevention}</label>
                <textarea 
                  required
                  rows={3}
                  value={newAnswer.prevention}
                  onChange={(e) => setNewAnswer(prev => ({ ...prev, prevention: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : 'Submit Advice'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAnswerForm(false)}
                  className="px-6 py-3 rounded-xl font-bold text-emerald-600 border border-emerald-100 hover:bg-emerald-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-6">
          {answers.map((answer) => (
            <motion.div 
              key={answer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl p-8 border ${
                post.bestAnswerId === answer.id ? 'border-amber-400 shadow-amber-100 shadow-lg' : 'border-emerald-100 shadow-sm'
              } relative`}
            >
              {post.bestAnswerId === answer.id && (
                <div className="absolute -top-3 left-8 bg-amber-400 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Trophy size={14} /> {t.bestAnswer}
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                    {answer.expertName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      {answer.expertName}
                      {answer.isVerifiedExpert && <ShieldCheck size={16} className="text-blue-500" />}
                    </div>
                    <div className="text-xs text-emerald-500">Agricultural Expert</div>
                  </div>
                </div>
                {profile?.uid === post.authorId && !post.bestAnswerId && (
                  <button 
                    onClick={() => handleSelectBest(answer)}
                    className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-200 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Select Best
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{t.diagnosis}</h4>
                    <p className="text-emerald-900 font-medium">{answer.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{t.pesticide}</h4>
                    <p className="text-emerald-900 font-medium">{answer.pesticide}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{t.treatment}</h4>
                    <p className="text-emerald-700 text-sm leading-relaxed">{answer.treatment}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{t.prevention}</h4>
                    <p className="text-emerald-700 text-sm leading-relaxed">{answer.prevention}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {answers.length === 0 && (
            <div className="text-center py-12 bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200 text-emerald-600">
              No expert advice yet. Waiting for agricultural scientists to respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
