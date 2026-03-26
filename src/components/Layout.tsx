import { Outlet, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { LogOut, Target } from 'lucide-react';
import Footer from './Footer';

export default function Layout() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surfaceHover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter hover:opacity-80 transition">
              <Target className="text-primary" />
              <span className="text-gradient">Golf</span>Charity
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link to="/results" className="text-sm font-medium text-gray-300 hover:text-white transition hidden md:block">Results</Link>
              <Link to="/charities" className="text-sm font-medium text-gray-300 hover:text-white transition hidden md:block">Partners</Link>
              {session ? (
                <>
                  <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition">Dashboard</Link>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition ml-4 bg-background p-2 rounded-full border border-surfaceHover hover:border-red-400/50">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link to="/auth" className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
