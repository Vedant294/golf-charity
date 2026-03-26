import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Trophy, CalendarDays, Award } from 'lucide-react';

export default function Results() {
  const [draws, setDraws] = useState<any[]>([]);
  const [userWinnings, setUserWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    // Fetch all draws
    const { data: drawsData, error: drawsError } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false });

    if (!drawsError && drawsData) {
      setDraws(drawsData);
    }

    // Fetch current user details
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      // Fetch user's winnings
      const { data: winningsData, error: winningsError } = await supabase
        .from('winners')
        .select('*, draws(*)')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (!winningsError && winningsData) {
        setUserWinnings(winningsData);
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Draw <span className="text-gradient">Results</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Past draw winning numbers and your personalized prize outcomes.
        </p>
      </div>

      {userWinnings.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            Your Winnings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userWinnings.map((win) => (
              <div key={win.id} className="bg-surface border border-surfaceHover rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {format(new Date(win.draws?.created_at || win.created_at), 'MMMM yyyy')} Draw
                    </h3>
                    <p className="text-sm text-gray-400">Match Count: {win.match_count}</p>
                  </div>
                  <div className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Award size={14} />
                    Won
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black text-white">${Number(win.prize_amount).toFixed(2)}</p>
                  <p className="text-sm text-gray-400 mt-1 capitalize">Status: {win.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <CalendarDays className="text-primary" />
          Recent Draws
        </h2>
        <div className="space-y-6">
          {draws.map((draw) => (
             <div key={draw.id} className="bg-surface border border-surfaceHover rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {format(new Date(draw.created_at), 'MMMM yyyy')} Draw
                  </h3>
                  <p className="text-sm text-gray-400">
                    Drawn on {format(new Date(draw.created_at), 'MMM do, yyyy')}
                  </p>
               </div>
               <div className="flex flex-wrap gap-3">
                 {draw.numbers.map((num: number, idx: number) => (
                    <div key={idx} className="w-12 h-12 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-lg font-bold shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                      {num}
                    </div>
                 ))}
               </div>
             </div>
          ))}
          {draws.length === 0 && (
            <div className="text-center py-12 bg-surface/50 rounded-xl border border-surfaceHover border-dashed">
              <p className="text-gray-400">No draws have occurred yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
