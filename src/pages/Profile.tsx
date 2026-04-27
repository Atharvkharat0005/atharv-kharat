import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, ShieldCheck, Award, MessageSquare, Save, Loader2, Phone, AlertCircle, Play } from 'lucide-react';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [expertise, setExpertise] = useState(profile?.expertise || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [testingCall, setTestingCall] = useState(false);

  const handleTestCall = async () => {
    if (!phoneNumber) {
      alert("Please enter a phone number first.");
      return;
    }
    setTestingCall(true);
    try {
      const response = await fetch('/api/make-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: "नमस्कार, हे स्मार्ट एग्री प्लॅटफॉर्मवरून एक चाचणी कॉल आहे. तुमची ट्विलिओ कॉन्फिगरेशन यशस्वीरित्या कार्य करत आहे.",
          language: 'mr'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Call initiated successfully! Check your phone.");
      } else {
        alert(`Call failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Test call error:", error);
      alert("Request failed. Is the server running?");
    } finally {
      setTestingCall(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        expertise,
        phoneNumber
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="bg-emerald-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg object-cover" />
            ) : (
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-emerald-700">
                {profile.displayName[0]}
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
                {profile.displayName}
                {profile.isVerified && <ShieldCheck className="text-blue-500" size={24} />}
              </h1>
              <p className="text-emerald-600 font-medium uppercase tracking-wider text-sm">{profile.role}</p>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-400 block font-bold">EMAIL</span>
              <span className="text-emerald-900 font-medium">{profile.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <div className="text-xs text-emerald-400 font-bold">REPUTATION</div>
                <div className="text-xl font-bold text-emerald-900">{profile.reputation}</div>
              </div>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="text-xs text-emerald-400 font-bold">CONTRIBUTIONS</div>
                <div className="text-xl font-bold text-emerald-900">{profile.answersCount}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Phone size={18} className="text-emerald-600" /> Phone Number (for AI Advisory Calls)
              </label>
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 95299 60309"
                className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700 leading-tight">
                  IMPORTANT: You must include your country code (e.g., +91 for India). 
                  If you are using a Twilio Trial account, this number MUST be verified in your Twilio Console.
                </p>
              </div>
            </div>

            {profile.role === 'expert' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-900">Area of Expertise</label>
                <textarea 
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="e.g. Agronomy, Soil Science, Pest Management..."
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  rows={3}
                />
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>
          </div>

          <div className="pt-6 border-t border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-emerald-600" /> Twilio Testing
            </h3>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
              <p className="text-sm text-amber-800">
                Test if your Twilio setup is working by triggering a Marathi test call to yourself.
              </p>
              <button 
                onClick={handleTestCall}
                disabled={testingCall}
                className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testingCall ? <Loader2 className="animate-spin" /> : <><Play size={16} /> Send Test Call</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Account Security</h2>
        <p className="text-emerald-300 text-sm mb-6">Your account is secured with Google Authentication. You can manage your security settings in your Google Account.</p>
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <ShieldCheck size={16} />
          Verified Account Status: {profile.isVerified ? 'Active' : 'Pending Verification'}
        </div>
      </div>
    </div>
  );
};

export default Profile;
