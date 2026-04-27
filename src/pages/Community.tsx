import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, MapPin, Sprout, Image as ImageIcon, X, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { diagnoseImage } from '../services/gemini';

const Community: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newPost, setNewPost] = useState({
    cropName: '',
    problem: '',
    location: '',
    image: null as string | null,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);

    try {
      let aiDiagnosis = null;
      let aiConfidence = null;

      if (newPost.image) {
        const base64Data = newPost.image.split(',')[1];
        const diagnosis = await diagnoseImage(base64Data, newPost.cropName);
        aiDiagnosis = diagnosis.disease;
        aiConfidence = diagnosis.confidence;
      }

      await addDoc(collection(db, 'posts'), {
        authorId: profile.uid,
        authorName: profile.displayName,
        cropName: newPost.cropName,
        problem: newPost.problem,
        location: newPost.location,
        imageUrl: newPost.image || null,
        aiDiagnosis,
        aiConfidence,
        createdAt: serverTimestamp(),
      });

      setNewPost({ cropName: '', problem: '', location: '', image: null });
      setShowModal(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">{t.community}</h1>
          <p className="text-emerald-600">Share your crop problems and get advice from experts.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus size={20} /> {t.postProblem}
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
        <input 
          type="text"
          placeholder="Search by crop, problem, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">{t.loading}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <motion.div 
              key={post.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {post.imageUrl && (
                <div className="h-48 overflow-hidden relative">
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {post.aiDiagnosis && (
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      AI Diagnosed
                    </div>
                  )}
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{post.cropName}</span>
                  <span className="text-[10px] text-emerald-400">{new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-2 line-clamp-2">{post.problem}</h3>
                <div className="flex items-center gap-1 text-xs text-emerald-500 mb-4">
                  <MapPin size={12} /> {post.location}
                </div>
                
                <div className="mt-auto pt-4 border-t border-emerald-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-700">
                      {post.authorName[0]}
                    </div>
                    <span className="text-xs font-medium text-emerald-700">{post.authorName}</span>
                  </div>
                  <Link 
                    to={`/post/${post.id}`}
                    className="text-emerald-600 text-sm font-bold hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus /> {t.postProblem}
                </h2>
                <button onClick={() => setShowModal(false)} className="hover:bg-emerald-700 p-1 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-900">{t.cropName}</label>
                    <input 
                      required
                      value={newPost.cropName}
                      onChange={(e) => setNewPost(prev => ({ ...prev, cropName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-900">{t.location}</label>
                    <input 
                      required
                      value={newPost.location}
                      onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-900">Problem Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={newPost.problem}
                    onChange={(e) => setNewPost(prev => ({ ...prev, problem: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-900">Upload Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 border-2 border-dashed border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors">
                      <ImageIcon className="text-emerald-300 mb-2" size={32} />
                      <span className="text-xs text-emerald-500">Click to upload image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {newPost.image && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-100">
                        <img src={newPost.image} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="animate-spin" /> Analyzing & Posting...</> : t.submit}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
