import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Trophy, Heart, Calendar, CheckCircle2, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [featuredCharities, setFeaturedCharities] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('charities').select('*').eq('is_active', true).limit(3).then(({ data }) => {
      setFeaturedCharities(data || []);
    });
  }, []);
  return (
    <div className="flex flex-col items-center w-full bg-background overflow-hidden relative">
      {/* Dynamic Background Image Hero */}
      <section className="w-full relative min-h-[95vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          {/* Beautiful misty golf course background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535136104956-61ea33e14781?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity transform scale-105 animate-[fadeIn_2s_ease-out_forwards]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 z-10" />
        </div>
        
        <div className="relative z-20 max-w-5xl mx-auto space-y-8 mt-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surfaceHover/50 bg-black/40 backdrop-blur-md mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wide text-gray-200">Global Draws Live</span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[1.05] animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Play with Purpose. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-300 to-secondary animate-pulse" style={{animationDuration: '4s'}}>
              Transform the Game.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up opacity-0" style={{animationDelay: '0.4s'}}>
            Join the world's most exclusive golf fellowship. Track your Stableford scores, dominate the rollover pool, and effortlessly support charities with every swing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 w-full animate-fade-in-up opacity-0" style={{animationDelay: '0.6s'}}>
            <Link to="/auth" className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-extrabold text-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition transform hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Enter The Club <ArrowRight size={22} className="text-primary"/>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Platform Engine */}
      <section id="how-it-works" className="w-full bg-surface border-y border-surfaceHover py-32 relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">The Golfer's Engine</h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">A beautifully engineered connection between your handicap, your heart, and your wallet.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Heart size={36}/>, title: 'Impact Foundation', desc: 'A guaranteed 10%+ from your active membership immediately supports a registered partner charity of your choice.' },
              { icon: <Calendar size={36}/>, title: 'Rolling 5 History', desc: 'Input your Stableford scores after any round. We dynamically keep your 5 latest rounds active in the system.' },
              { icon: <Trophy size={36}/>, title: 'The Monthly Draw', desc: 'Secure 3, 4, or 5 matches during our massive monthly draw to capture thousands from the global rollover pool.' },
            ].map((feature, i) => (
              <div key={i} className="bg-background/80 backdrop-blur-sm p-10 rounded-[2rem] border border-surfaceHover hover:border-primary/40 transition duration-500 group shadow-lg hover:shadow-[0_10px_40px_rgba(124,58,237,0.1)] hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/20 transition duration-500 flex-shrink-0"></div>
                <div className="w-16 h-16 rounded-2xl bg-surface border border-surfaceHover flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition duration-500 shadow-md relative z-10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white relative z-10">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light relative z-10">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Pricing Panel */}
      <section id="pricing" className="w-full max-w-7xl mx-auto px-4 py-32 relative">
        <div className="text-center mb-20 animate-fade-in text-gray-200">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Membership Tiers</h2>
          <p className="text-xl text-gray-400">Join thousands of golfers elevating the sport worldwide.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Base */}
          <div className="bg-surface/50 backdrop-blur-lg p-12 rounded-[2.5rem] border border-surfaceHover flex flex-col relative transition duration-300 hover:border-gray-500/50">
            <h3 className="text-2xl font-bold mb-3 text-gray-300">Club Member</h3>
            <div className="flex items-baseline gap-2 mb-8 border-b border-surfaceHover pb-8">
              <span className="text-6xl font-black text-white">$19</span>
              <span className="text-gray-400 font-medium">.99 /mo</span>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              {['1 Automatic Draw Entry', 'Track Rolling 5 Scores', '10% Philanthropy Allocation', 'Member Dashboard'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-gray-300 font-medium tracking-wide">
                  <CheckCircle2 className="text-primary shrink-0 opacity-80" size={22} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth" className="w-full py-4 text-center rounded-2xl font-bold bg-background border border-surfaceHover hover:border-white transition text-lg tracking-wide shadow-sm hover:shadow-md">
              Select Monthly
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-b from-[#151b2c] to-surface p-12 rounded-[2.5rem] border border-primary/50 flex flex-col relative transform md:-translate-y-6 shadow-[0_20px_60px_rgba(124,58,237,0.15)] group hover:border-primary transition duration-500">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="absolute top-6 right-8 bg-primary/20 text-primary text-xs font-black tracking-widest px-4 py-1.5 rounded-full border border-primary/30 uppercase">Pro</div>
            
            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-primary transition">Tour Elite</h3>
            <div className="flex items-baseline gap-2 mb-8 border-b border-surfaceHover pb-8">
              <span className="text-6xl font-black text-white">$199</span>
              <span className="text-gray-400 font-medium">.99 /yr</span>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              {['Save $40 Annually', 'Priority Draw Queueing', '15% Boosted Philanthropy', 'Exclusive Partner Invites', 'Premium Metric Analytics'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-gray-100 font-medium tracking-wide">
                  <CheckCircle2 className="text-secondary shrink-0" size={22} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth" className="w-full py-4 text-center rounded-2xl font-bold bg-gradient-primary text-white hover:opacity-90 transition text-lg tracking-wide shadow-xl transform group-hover:scale-[1.02]">
              Select Annual
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Charity Spotlight */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-bold border border-secondary/20 mb-4">
            <Heart size={14} className="fill-current" /> Impact Partners
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Spotlight Charities</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Every subscription directly funds these verified global organisations. You choose who benefits.</p>
        </div>
        {featuredCharities.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-surfaceHover rounded-2xl text-gray-500">
            Charity partners coming soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {featuredCharities.map(c => (
              <div key={c.id} className="bg-surface border border-surfaceHover rounded-2xl p-8 hover:border-secondary/40 transition group">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-5 group-hover:bg-secondary group-hover:text-white transition">
                  <Globe size={22} />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{c.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.description || 'Dedicated to creating lasting global impact.'}</p>
              </div>
            ))}
          </div>
        )}
        <div className="text-center">
          <Link to="/charities" className="inline-flex items-center gap-2 px-8 py-3 border border-surfaceHover rounded-full text-sm font-bold text-gray-300 hover:text-white hover:border-white transition">
            View All Partners <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Visual CTA */}
      <section className="w-full border-t border-surfaceHover py-32 bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587143185708-674ef4a1c09b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        
        <div className="relative z-20 text-center max-w-3xl px-4 animate-float">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-8 drop-shadow-2xl text-white">Drive for Show.<br/> Putt for Impact.</h2>
          <Link to="/auth" className="inline-flex px-14 py-5 bg-white text-black rounded-full font-extrabold text-xl hover:bg-gray-200 transition transform hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.4)]">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
