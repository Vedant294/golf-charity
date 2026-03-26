import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, Globe, ArrowUpRight, Search, DollarSign } from 'lucide-react';

export default function Charities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').eq('is_active', true);
    setCharities(data || []);
  };

  const filteredCharities = charities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const independentDonation = () => {
    alert("Redirecting to Independent Donation Checkout...");
    // Phase 3 Stripe Hook
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 w-full space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-center bg-surface/40 p-10 rounded-[2.5rem] border border-surfaceHover shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="relative z-10 max-w-xl text-center md:text-left mb-8 md:mb-0">
          <div className="inline-flex flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20 mb-4">
            <Heart size={14} className="fill-current" /> Global Impact
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Impact Foundations</h1>
          <p className="text-lg text-gray-400 font-light leading-relaxed">
            Every subscription fuels change. Partner with these verified global organizations. Explore their mission and make an independent contribution at any time.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
          <button onClick={independentDonation} className="bg-white text-black font-extrabold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:scale-105">
            <DollarSign size={20}/> Direct Donation
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-surfaceHover pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-gray-400" /> Active Partners</h2>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search charities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-surfaceHover rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-surface/30 rounded-3xl border border-surfaceHover border-dashed">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No charity partners added yet.</p>
          </div>
        ) : filteredCharities.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-400">No charities match your search.</div>
        ) : (
          filteredCharities.map((c) => (
            <div key={c.id} className="bg-surface rounded-2xl border border-surfaceHover overflow-hidden hover:border-primary/50 transition duration-500 flex flex-col group shadow-lg">
              <div className="h-48 bg-gradient-to-br from-background to-[#111] relative overflow-hidden flex items-center justify-center border-b border-surfaceHover/50">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-80" />
                ) : (
                  <Globe size={80} strokeWidth={1} className="text-gray-700/50 group-hover:text-primary/20 transition duration-500 group-hover:scale-110"/>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col bg-surface">
                <h3 className="text-xl font-black text-white mb-2">{c.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 font-light">{c.description || 'Dedicated to creating lasting impact.'}</p>
                <button className="w-full py-3 bg-background border border-surfaceHover hover:border-primary text-gray-300 hover:text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 group-hover:bg-primary/5">
                  View Impact Report <ArrowUpRight size={14} className="text-primary" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
