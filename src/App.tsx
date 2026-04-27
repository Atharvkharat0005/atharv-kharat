import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdvisoryForm from './pages/AdvisoryForm';
import RiskAnalysis from './pages/RiskAnalysis';
import Community from './pages/Community';
import PostDetails from './pages/PostDetails';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import About from './pages/About';
import DiseaseDetection from './pages/DiseaseDetection';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-emerald-50/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/advisory/new" element={<ProtectedRoute><AdvisoryForm /></ProtectedRoute>} />
          <Route path="/risk/:id" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
          <Route path="/community" element={<Community />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="bg-emerald-900 text-emerald-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 Smart Agriculture Advisory Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
