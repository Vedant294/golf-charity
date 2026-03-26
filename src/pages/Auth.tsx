import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Target, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Heart, Percent, ArrowRight } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [charityId, setCharityId] = useState('');
  const [contributionPercent, setContributionPercent] = useState<number>(10);
  const [planType, setPlanType] = useState('monthly');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Data State
  const [charities, setCharities] = useState<any[]>([]);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*').eq('is_active', true);
      if (data) setCharities(data);
    };
    fetchCharities();
  }, []);

  useEffect(() => {
    if (password.length === 0) setPasswordStrength('');
    else if (password.length < 6) setPasswordStrength('Weak');
    else if (password.length < 10) setPasswordStrength('Fair');
    else setPasswordStrength('Strong');
  }, [password]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!isLogin && contributionPercent < 10) {
      alert("Minimum contribution is 10%.");
      return;
    }
    if (!isLogin && !acceptedTerms) {
      alert("You must accept the Terms & Conditions.");
      return;
    }
    if (!isLogin && !charityId) {
      alert("Please select a partner charity.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        
        if (error) throw error;

        if (data?.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            charity_id: charityId,
            contribution_percent: contributionPercent,
            plan_type: planType,
            is_subscribed: true // mock subscribed on register
          });
        }
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const resetPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset your password.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert("Password reset email sent!");
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans text-gray-200">
      
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 bg-surface/95 backdrop-blur-2xl z-20 min-h-screen py-16 lg:py-12 relative border-r border-surfaceHover/30">
        
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-12 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto lg:mx-0 mb-8 shadow-[0_0_40px_rgba(124,58,237,0.4)] text-white">
              <Target size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white drop-shadow-sm">
              {isLogin ? 'Welcome back.' : 'The First Tee.'}
            </h2>
            <p className="text-gray-400 font-medium text-lg leading-relaxed">
              {isLogin ? 'Enter your credentials to access the clubhouse.' : 'Secure your locker. Register to start competing.'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-background/50 border border-surfaceHover focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-11 pr-5 py-3.5 text-white outline-none transition-all shadow-inner font-medium"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vip@club.com"
                  className="w-full bg-background/50 border border-surfaceHover focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-11 pr-5 py-3.5 text-white outline-none transition-all shadow-inner font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-300">Password</label>
                {isLogin && (
                  <button type="button" onClick={resetPassword} className="text-xs font-bold text-primary hover:text-white transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background/50 border border-surfaceHover focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-11 pr-12 py-3.5 text-white outline-none transition-all shadow-inner font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && password && (
                <div className="mt-3 text-xs font-bold flex gap-2 items-center bg-surface p-2 rounded-lg border border-surfaceHover">
                  <span className="text-gray-400">Strength:</span> 
                  <span className={`${passwordStrength === 'Weak' ? 'text-red-400' : passwordStrength === 'Fair' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>

            {!isLogin && (
              <>
                <div className="animate-[fadeIn_0.5s_ease-out]">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background/50 border border-surfaceHover focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-11 pr-5 py-3.5 text-white outline-none transition-all shadow-inner font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-surfaceHover/50 animate-[fadeIn_0.6s_ease-out]">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Partner Charity</label>
                  <div className="relative group">
                    <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-colors" />
                    <select 
                      value={charityId}
                      onChange={(e) => setCharityId(e.target.value)}
                      className="w-full bg-background/50 border border-surfaceHover focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl pl-11 pr-5 py-3.5 text-white outline-none transition-all shadow-inner font-medium appearance-none"
                      required
                    >
                      <option value="" disabled>Select a charity to support</option>
                      {charities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="animate-[fadeIn_0.7s_ease-out]">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-300">Contribution %</label>
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">Min 10%</span>
                  </div>
                  <div className="relative group">
                    <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-colors" />
                    <input 
                      type="number"
                      min="10"
                      max="100"
                      value={contributionPercent}
                      onChange={(e) => setContributionPercent(Number(e.target.value))}
                      className="w-full bg-background/50 border border-surfaceHover focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl pl-11 pr-5 py-3.5 text-white outline-none transition-all shadow-inner font-bold text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="animate-[fadeIn_0.8s_ease-out] pt-2">
                  <label className="block text-sm font-bold text-gray-300 mb-3">Subscription Tier</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden ${planType === 'monthly' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(124,58,237,0.15)] ring-1 ring-primary/50' : 'border-surfaceHover bg-background/50 hover:border-gray-500 hover:bg-surface'}`}>
                      <input type="radio" className="hidden" name="plan" checked={planType === 'monthly'} onChange={() => setPlanType('monthly')} />
                      {planType === 'monthly' && <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-xl flex items-center justify-center"><ArrowRight size={14} className="text-white"/></div>}
                      <div className="font-black text-white text-lg mb-1">Monthly</div>
                      <div className="text-sm font-medium text-gray-400">$19.99 / mo</div>
                    </label>
                    <label className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden ${planType === 'yearly' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(124,58,237,0.15)] ring-1 ring-primary/50' : 'border-surfaceHover bg-background/50 hover:border-gray-500 hover:bg-surface'}`}>
                      <input type="radio" className="hidden" name="plan" checked={planType === 'yearly'} onChange={() => setPlanType('yearly')} />
                      {planType === 'yearly' && <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-xl flex items-center justify-center"><ArrowRight size={14} className="text-white"/></div>}
                      <div className="font-black text-white text-lg mb-1">Yearly</div>
                      <div className="text-sm font-medium text-gray-400">$199.99 / yr</div>
                      <div className="text-xs font-bold text-green-400 mt-2 bg-green-400/10 inline-block px-2 py-0.5 rounded">Save 16%</div>
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-6 p-4 bg-surface rounded-xl border border-surfaceHover animate-[fadeIn_0.9s_ease-out]">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={acceptedTerms} 
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 accent-primary rounded cursor-pointer shrink-0" 
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed cursor-pointer select-none">
                    I agree to the <span className="text-white font-bold hover:text-primary transition-colors">Terms & Conditions</span> and <span className="text-white font-bold hover:text-primary transition-colors">Privacy Policy</span>. My contribution will be automatically deducted.
                  </label>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer" 
                />
                <label htmlFor="remember" className="text-sm font-bold text-gray-300 cursor-pointer select-none">
                  Remember Me
                </label>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-primary text-white font-black text-lg py-4 flex items-center justify-center rounded-xl hover:opacity-90 disabled:opacity-70 transition-all duration-300 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] mt-8 transform active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-pulse flex items-center gap-2"><ArrowRight className="animate-spin" size={20}/> Authorizing...</span>
              ) : (
                isLogin ? 'Sign In to Dashboard' : 'Finalize Registration'
              )}
            </button>
          </form>

          <div className="my-8 flex items-center opacity-60">
            <div className="flex-grow border-t border-surfaceHover"></div>
            <span className="px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-surfaceHover"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-surface border border-surfaceHover text-white font-bold text-md py-4 flex items-center justify-center gap-3 rounded-xl hover:bg-surfaceHover hover:border-gray-500 transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google OAuth
          </button>

          <p className="mt-10 text-center text-gray-400 font-medium">
            {isLogin ? "No locker yet?" : "Already an established member?"}
            <button onClick={() => {setIsLogin(!isLogin); window.scrollTo({top: 0, behavior: 'smooth'});}} className="text-white hover:text-primary transition-colors font-bold underline decoration-primary/50 hover:decoration-primary underline-offset-4 ml-2">
              {isLogin ? 'Register Here' : 'Log In Instead'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Image/Brand Side - Hidden on Mobile, Premium Dark Aesthetic */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center fixed inset-y-0 right-0">
        <div className="absolute inset-0 z-0 scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]">
          <img src="https://images.unsplash.com/photo-1535136154641-fcba49bbf073?q=80&w=2600&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 contrast-125 saturate-50 mix-blend-luminosity" alt="Abstract Premium Golf" />
        </div>
        
        {/* Complex Gradients for blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10 w-32" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
        
        <div className="relative z-20 max-w-xl text-left p-12 md:p-16 mx-auto backdrop-blur-md bg-black/40 border border-white/5 rounded-3xl shadow-2xl">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl opacity-50 z-[-1]" />
          
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary mb-8 rounded-full"></div>
          <blockquote className="text-3xl font-light text-white mb-10 leading-snug">
            "We’ve entirely redefined what a scorecard implies. It's no longer just numbers—it’s legacy, exclusivity, and localized philanthropy."
          </blockquote>
          <cite className="flex items-center gap-5 not-italic">
            <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_15px_rgba(124,58,237,0.5)]">
               <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Member" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-lg tracking-wide uppercase">Jonathan K.</span>
              <span className="text-gray-400 font-bold text-sm tracking-widest uppercase mt-0.5">Founding Member</span>
            </div>
          </cite>
        </div>
      </div>

    </div>
  );
}
