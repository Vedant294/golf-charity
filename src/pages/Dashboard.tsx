import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, History, ArrowRight, CreditCard, Activity, Star, UploadCloud, Heart, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [newScore, setNewScore] = useState('');
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [charityData, setCharityData] = useState<any>(null);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }
    setUser(user);
    const { data: ud } = await supabase.from('users').select('*, charities(name, description)').eq('id', user.id).single();
    setUserData(ud);
    if (ud?.charities) setCharityData(ud.charities);

    const { data: s } = await supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false });
    setScores(s || []);

    const { data: w } = await supabase.from('winners').select('*, draws(month, year)').eq('user_id', user.id).order('created_at', { ascending: false });
    setWinnings(w || []);

    const { data: d } = await supabase.from('draws').select('id').order('created_at', { ascending: false });
    setDraws(d || []);

    setPageLoading(false);
  };

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore || Number(newScore) < 1 || Number(newScore) > 45) return alert('Score must be between 1 and 45');
    if (!scoreDate) return alert('Please select a date for this round');
    setLoading(true);
    const { error } = await supabase.from('scores').insert([{
      user_id: user.id,
      score: Number(newScore),
      score_date: new Date(scoreDate).toISOString()
    }]);
    setLoading(false);
    if (error) alert(error.message);
    else { setNewScore(''); fetchUserData(); }
  };

  const handleSubscriptionClick = async (planType: 'monthly' | 'yearly' = 'monthly') => {
    try {
      const { data, error } = await supabase.functions.invoke('create_checkout_session', {
        body: { planType, userId: user?.id, returnUrl: window.location.origin + '/dashboard' }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error('No checkout URL returned');
    } catch (err: any) {
      console.error('Stripe error:', err.message);
      alert('Payment system not configured. Contact admin to activate your subscription.');
    }
  };

  const uploadProof = async (e: React.ChangeEvent<HTMLInputElement>, winnerId: string) => {
    try {
      setUploadingProof(winnerId);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${winnerId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath);

      await supabase.from('winners').update({ proof_url: publicUrl }).eq('id', winnerId);
      alert('Proof uploaded successfully! Waiting for Admin verification.');
      fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Error uploading proof.');
    } finally {
      setUploadingProof(null);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const totalWon = winnings.reduce((sum, w) => sum + Number(w.prize_amount || 0), 0);
  const renewalDate = userData?.subscription_end ? new Date(userData.subscription_end).toLocaleDateString() : 'N/A';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8 pb-32">
      {/* Header Profile / Subscription Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-surface to-surfaceHover p-8 rounded-3xl border border-surfaceHover shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full mix-blend-screen" />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Member Portal</h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Status:</span>
              {userData?.is_subscribed ? (
                <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20 flex items-center gap-1">
                  <Star size={14}/> Active — {userData?.plan_type || 'monthly'}
                </span>
              ) : (
                <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/20 flex items-center gap-1">
                  <Activity size={14}/> Inactive
                </span>
              )}
            </div>
            {userData?.is_subscribed && renewalDate !== 'N/A' && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar size={11}/> Renews: {renewalDate}</p>
            )}
            {!userData?.is_subscribed && (
              <div className="flex gap-3 mt-4 flex-wrap">
                <button onClick={() => handleSubscriptionClick('monthly')} className="px-6 py-2 bg-gradient-primary rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition transform">
                  Monthly — $19.99
                </button>
                <button onClick={() => handleSubscriptionClick('yearly')} className="px-6 py-2 bg-secondary/20 border border-secondary/40 text-secondary rounded-xl font-bold text-sm hover:bg-secondary hover:text-white transition">
                  Yearly — $199.99
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{user?.email}</p>
          </div>
          
          <div className="mt-6 md:mt-0 text-left md:text-right bg-background/50 p-6 rounded-2xl border border-surfaceHover backdrop-blur-sm">
            <p className="text-sm text-gray-400 font-medium">Participation Summary</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">{draws.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total draws run</p>
            <p className="text-xs text-primary mt-2 flex justify-end gap-1 items-center"><Trophy size={12}/> {winnings.length} wins · ${totalWon.toFixed(2)} earned</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Scores) */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-surface p-8 rounded-3xl border border-surfaceHover shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[50px] rounded-full group-hover:bg-secondary/10 transition duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Submit Score</h2>
                    <p className="text-sm text-gray-400">Stableford format (1-45)</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={submitScore} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="number" 
                    min="1" max="45"
                    value={newScore}
                    onChange={e => setNewScore(e.target.value)}
                    placeholder="Enter your score (1-45)..."
                    className="flex-1 bg-background border border-surfaceHover focus:border-secondary focus:ring-1 focus:ring-secondary rounded-xl px-6 py-4 text-white outline-none transition text-lg"
                    required
                  />
                  <input
                    type="date"
                    value={scoreDate}
                    onChange={e => setScoreDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-background border border-surfaceHover focus:border-secondary rounded-xl px-4 py-4 text-white outline-none transition text-sm"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !userData?.is_subscribed}
                  className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {loading ? 'Saving...' : <> Add Score <ArrowRight size={20} /></>}
                </button>
              </form>
              {!userData?.is_subscribed && (
                <p className="text-red-400 text-sm mt-3 font-medium">You must be subscribed to submit scores.</p>
              )}
            </div>
          </div>

          <div className="bg-surface p-8 rounded-3xl border border-surfaceHover shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <History className="text-primary" />
              <h2 className="text-xl font-bold">Your Active Scoring History</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">Only your latest 5 scores are evaluated in the monthly draw.</p>
            
            <div className="space-y-3">
              {scores.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-surfaceHover rounded-2xl bg-background/50 text-gray-500">
                  No rounds recorded yet. Hit the course!
                </div>
              ) : (
                scores.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-5 rounded-xl bg-background border border-surfaceHover hover:border-primary/30 transition">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-surfaceHover flex items-center justify-center text-xs font-bold text-gray-400">
                        {scores.length - i}
                      </span>
                      <span className="font-medium text-gray-300">Round {new Date(s.score_date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{s.score} <span className="text-sm font-normal text-gray-500">pts</span></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Winnings & Charity) */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-gradient-to-br from-surface to-background p-8 rounded-3xl border border-surfaceHover shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-green-400" />
              <h2 className="text-xl font-bold">Prize Wallet</h2>
            </div>
            
            {winnings.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No winnings yet. Enter scores to participate in the next draw.</p>
            ) : (
              <div className="space-y-4">
                {winnings.map((w, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface border border-surfaceHover">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Draw {w.draws?.month}/{w.draws?.year}</span>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${w.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">{w.match_count} Matches</span>
                      <span className="text-xl font-bold text-green-400">${w.prize_amount}</span>
                    </div>
                    {w.status === 'pending' && !w.proof_url && (
                      <div className="mt-3 pt-3 border-t border-surfaceHover">
                        <label className="flex items-center justify-center gap-2 cursor-pointer bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-2 rounded-xl transition text-sm font-bold">
                          {uploadingProof === w.id ? 'Uploading...' : <><UploadCloud size={16}/> Upload Screenshot Proof</>}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadProof(e, w.id)} disabled={uploadingProof === w.id} />
                        </label>
                      </div>
                    )}
                    {w.proof_url && w.status === 'pending' && (
                       <p className="mt-3 text-xs text-primary font-bold text-center border-t border-surfaceHover pt-3">Under Admin Review</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-primary p-8 rounded-3xl shadow-[0_0_30px_rgba(124,58,237,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593118116515-e2db352b2b1a?q=80&w=600&auto=format&fit=crop')] mix-blend-overlay opacity-20 group-hover:opacity-30 transition duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={18} className="text-white" />
                <h2 className="text-xl font-black text-white">My Charity</h2>
              </div>
              {charityData ? (
                <div className="mb-4">
                  <p className="text-white font-bold text-lg">{charityData.name}</p>
                  <p className="text-white/70 text-sm mt-1">Contributing <span className="font-bold text-white">{userData?.contribution_percent || 10}%</span> of your subscription</p>
                </div>
              ) : (
                <p className="text-white/80 text-sm mb-4">No charity selected yet.</p>
              )}
              <Link to="/charities" className="inline-flex w-full items-center justify-center px-4 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition shadow-lg">
                {charityData ? 'Change Charity' : 'Select a Charity'}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
