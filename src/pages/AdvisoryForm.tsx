import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateAdvisory } from '../services/gemini';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Sprout, Thermometer, Droplets, CloudRain, MapPin, Ruler, Loader2 } from 'lucide-react';

const AdvisoryForm: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    soilType: '',
    fieldSize: '',
    temperature: 25,
    humidity: 60,
    rainfall: 100,
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const advisoryData = await generateAdvisory(formData);
      const docRef = await addDoc(collection(db, 'advisories'), {
        ...formData,
        ...advisoryData,
        userId: profile.uid,
        createdAt: serverTimestamp(),
      });
      navigate(`/risk/${docRef.id}`);
    } catch (error) {
      console.error("Error generating advisory:", error);
      alert("Failed to generate advisory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'temperature' || name === 'humidity' || name === 'rainfall' ? Number(value) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
        <div className="bg-emerald-600 p-8 text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sprout size={32} /> {t.advisory}
          </h1>
          <p className="text-emerald-100 mt-2">Fill in your field details to get AI-powered recommendations.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Sprout size={16} className="text-emerald-600" /> {t.cropName}
              </label>
              <input
                required
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder="e.g. Cotton, Wheat"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" /> {t.location}
              </label>
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Maharashtra, India"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Ruler size={16} className="text-emerald-600" /> {t.fieldSize}
              </label>
              <input
                required
                name="fieldSize"
                value={formData.fieldSize}
                onChange={handleChange}
                placeholder="e.g. 5 Acres"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Sprout size={16} className="text-emerald-600" /> {t.soilType}
              </label>
              <select
                required
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select Soil Type</option>
                <option value="Black Soil">Black Soil</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Red Soil">Red Soil</option>
                <option value="Sandy Soil">Sandy Soil</option>
                <option value="Clayey Soil">Clayey Soil</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Thermometer size={16} className="text-emerald-600" /> {t.temperature} (°C)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Droplets size={16} className="text-emerald-600" /> {t.humidity} (%)
              </label>
              <input
                type="number"
                name="humidity"
                value={formData.humidity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CloudRain size={16} className="text-emerald-600" /> {t.rainfall} (mm)
              </label>
              <input
                type="number"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" /> {t.loading}</> : t.getAdvisory}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdvisoryForm;
