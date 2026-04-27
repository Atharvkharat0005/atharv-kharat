import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, LayoutDashboard, MessageSquare, Trophy, User, LogOut, Globe, Search, Key } from 'lucide-react';
import { Language } from '../types';

const Navbar: React.FC = () => {
  const { profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [hasApiKey, setHasApiKey] = React.useState(true);

  React.useEffect(() => {
    const checkApiKey = async () => {
      if (!process.env.GEMINI_API_KEY) {
        // @ts-ignore
        if (window.aistudio) {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } else {
          setHasApiKey(false);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const navItems = [
    { name: t.home, path: '/', icon: Sprout },
    { name: t.diseaseDetection, path: '/disease-detection', icon: Search },
    { name: t.community, path: '/community', icon: MessageSquare },
    { name: t.leaderboard, path: '/leaderboard', icon: Trophy },
  ];

  if (profile) {
    navItems.push({ name: t.dashboard, path: '/dashboard', icon: LayoutDashboard });
  }

  return (
    <nav className="bg-emerald-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Sprout className="text-emerald-400" />
              <span className="hidden sm:inline">{t.title}</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === item.path ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-700'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!hasApiKey && (
              // @ts-ignore
              window.aistudio && (
                <button 
                  onClick={handleOpenKeyDialog}
                  className="hidden sm:flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-all shadow-sm"
                >
                  <Key size={14} /> Select Gemini Key
                </button>
              )
            )}
            <div className="flex bg-emerald-900 rounded-lg p-1">
              {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    language === lang ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-300 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {profile ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:text-emerald-300 transition-colors">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full border border-emerald-400" />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden lg:inline text-sm font-medium">{profile.displayName}</span>
                </Link>
                <button onClick={logout} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/" className="bg-white text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors">
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
