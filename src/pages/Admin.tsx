import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Users, PlayCircle, Plus, Globe, Shield, BarChart2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [charityName, setCharityName] = useState('');
  const [charityDesc, setCharityDesc] = useState('');
  const [runningDraw, setRunningDraw] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => { checkAdminAccess(); }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }
    const { data: ud } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!ud || ud.role !== 'admin') { navigate('/dashboard'); return; }
    setAuthChecked(true);
    fetchData();
  };

  const fetchData = async () => {
    const { data: cfg } = await supabase.from('system_config').select('*').eq('id', 1).single();
    setConfig(cfg);
    const { data: w } = await supabase.from('winners').select('*, draws(month, year)').order('created_at', { ascending: false }).limit(20);
    setWinners(w || []);
    const { data: u } = await supabase.from('users').select('*, charities(name)').order('created_at', { ascending: false });
    setAllUsers(u || []);
    const { data: c } = await supabase.from('charities').select('*').order('created_at', { ascending: false });
    setCharities(c || []);
  };

  const executeDraw = async () => {
    if (!confirm('Execute monthly draw? This cannot be undone.')) return;
    setRunningDraw(true);
    try {
      const { data, error } = await supabase.functions.invoke('run_draw', { method: 'POST' });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      alert(`Draw executed! Winners found: ${data.winners_found}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error executing draw.');
    } finally { setRunningDraw(false); }
  };

  const verifyWinner = async (id: string, status: 'approved' | 'paid') => {
    const { error } = await supabase.from('winners').update({ status }).eq('id', id);
    if (error) return alert(error.message);
    fetchData();
  };

  const addCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charityName.trim()) return;
    const { error } = await supabase.from('charities').insert([{ name: charityName, description: charityDesc, is_active: true }]);
    if (error) return alert(error.message);
    setCharityName(''); setCharityDesc('');
    fetchData();
  };

  const deleteCharity = async (id: string) => {
    if (!confirm('Delete this charity?')) return;
    await supabase.from('charities').delete().eq('id', id);
    fetchData();
  };

  const toggleUserSub = async (userId: string, current: boolean) => {
    await supabase.from('users').update({ is_subscribed: !current }).eq('id', userId);
    fetchData();
  };

  const updateDrawType = async (drawType: string) => {
    await supabase.from('system_config').update({ draw_type: drawType }).eq('id', 1);
    fetchData();
  };

  if (!authChecked) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const activeMembers = allUsers.filter(u => u.is_subscribed).length;
  const totalPool = Number(config?.rollover_pool || 0);
  const totalCharity = allUsers.reduce((sum, u) => {
    if (!u.is_subscribed) return sum;
    const sub = u.plan_type === 'yearly' ? 199.99 : 19.99;
    return sum + (sub * (u.contribution_percent || 10) / 100);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surfaceHover pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="text-primary" size={20} />
            <h1 className="text-3xl font-black tracking-tight text-white">Command Center</h1>
          </div>
          <p className="text-gray-400 text-sm">Admin-only — full system control.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {['overview', 'users', 'charities', 'analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-bold rounded-xl transition capitalize text-sm ${activeTab === tab ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:text-white border border-surfaceHover'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-[#10072b] to-[#1a1135] p-10 rounded-[2rem] border border-primary/30 shadow-xl flex flex-col items-center text-center">
              <h2 className="text-2xl font-black text-white mb-2">Monthly Draw Engine</h2>
              <p className="text-gray-400 mb-5 max-w-sm text-sm">Runs draw, calculates prizes, emails winners automatically.</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-gray-400">Draw Mode:</span>
                <select value={config?.draw_type || 'random'} onChange={e => updateDrawType(e.target.value)}
                  className="bg-background border border-surfaceHover text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary">
                  <option value="random">Random</option>
                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>
              <button onClick={executeDraw} disabled={runningDraw}
                className="bg-gradient-primary px-10 py-4 rounded-xl flex items-center gap-3 hover:opacity-90 transition disabled:opacity-50">
                <PlayCircle className={`text-white w-6 h-6 ${runningDraw ? 'animate-spin' : ''}`} />
                <span className="text-xl font-black text-white tracking-widest uppercase">{runningDraw ? 'Executing...' : 'Run Draw'}</span>
              </button>
              {config?.last_draw_date && <p className="text-xs text-gray-500 mt-4">Last draw: {new Date(config.last_draw_date).toLocaleDateString()}</p>}
            </div>

            <div className="bg-surface p-8 rounded-3xl border border-surfaceHover shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Users className="text-primary" /> Winner Verification</h2>
              <div className="overflow-x-auto rounded-xl border border-surfaceHover">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surfaceHover text-gray-400 text-xs uppercase bg-surfaceHover/30">
                      <th className="py-3 px-4">Cycle</th><th className="py-3 px-4">Match</th>
                      <th className="py-3 px-4">Prize</th><th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surfaceHover">
                    {winners.length === 0
                      ? <tr><td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No winners yet.</td></tr>
                      : winners.map(w => (
                        <tr key={w.id} className="hover:bg-surfaceHover/20">
                          <td className="py-3 px-4 text-sm">{w.draws?.month}/{w.draws?.year}</td>
                          <td className="py-3 px-4 font-bold text-secondary">{w.match_count}</td>
                          <td className="py-3 px-4 font-bold text-green-400">${Number(w.prize_amount).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : w.status === 'approved' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-500'}`}>{w.status}</span>
                            {w.proof_url && <a href={w.proof_url} target="_blank" rel="noreferrer" className="block mt-1 text-[10px] text-primary hover:underline">View Proof</a>}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {w.status === 'pending' && <button onClick={() => verifyWinner(w.id, 'approved')} className="text-xs text-blue-400 font-bold hover:underline mr-3">Approve</button>}
                            {w.status === 'pending' && <button onClick={() => verifyWinner(w.id, 'paid')} className="text-xs text-red-400 font-bold hover:underline">Reject</button>}
                            {w.status === 'approved' && <button onClick={() => verifyWinner(w.id, 'paid')} className="text-xs text-green-400 font-bold hover:underline">Mark Paid</button>}
                            {w.status === 'paid' && <span className="text-xs text-gray-500">Complete</span>}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-surface p-6 rounded-3xl border border-surfaceHover shadow-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings className="text-gray-400" size={18} /> Health KPIs</h2>
              <div className="space-y-3">
                {[
                  { label: 'Rollover Pool', value: `$${totalPool.toFixed(2)}`, color: 'text-green-400' },
                  { label: 'Active Members', value: activeMembers, color: 'text-white' },
                  { label: 'Total Members', value: allUsers.length, color: 'text-white' },
                  { label: 'Charity Contributions', value: `$${totalCharity.toFixed(2)}`, color: 'text-secondary' },
                  { label: 'Pending Verifications', value: winners.filter(w => w.status === 'pending').length, color: 'text-yellow-400' },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-background rounded-xl p-4 border border-surfaceHover flex justify-between items-center">
                    <p className="text-xs text-gray-400">{kpi.label}</p>
                    <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-surface p-8 rounded-3xl border border-surfaceHover shadow-xl overflow-x-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Users className="text-primary" /> Member Directory</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surfaceHover text-gray-400 text-xs uppercase bg-surfaceHover/30">
                <th className="py-4 px-4">User ID</th><th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Plan</th><th className="py-4 px-4">Charity</th>
                <th className="py-4 px-4">Contrib %</th><th className="py-4 px-4 text-right">Subscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceHover">
              {allUsers.length === 0
                ? <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No users yet.</td></tr>
                : allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-surfaceHover/20">
                    <td className="py-3 px-4 text-xs text-gray-400 max-w-[120px] truncate" title={u.id}>{u.id}</td>
                    <td className="py-3 px-4"><span className={`text-xs font-bold uppercase px-2 py-1 rounded ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-surfaceHover text-gray-400'}`}>{u.role}</span></td>
                    <td className="py-3 px-4 text-sm capitalize">{u.plan_type || '—'}</td>
                    <td className="py-3 px-4 text-sm">{u.charities?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-sm">{u.contribution_percent}%</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => toggleUserSub(u.id, u.is_subscribed)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition ${u.is_subscribed ? 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' : 'bg-surfaceHover text-gray-400 border-gray-600 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30'}`}>
                        {u.is_subscribed ? 'Active (Revoke)' : 'Inactive (Activate)'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'charities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface p-8 rounded-3xl border border-surfaceHover shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Globe className="text-secondary" /> Add Partner</h2>
            <form onSubmit={addCharity} className="space-y-4">
              <input type="text" value={charityName} onChange={e => setCharityName(e.target.value)} placeholder="Charity name..." required
                className="w-full bg-background border border-surfaceHover focus:border-secondary rounded-xl px-5 py-3 text-white outline-none text-sm" />
              <textarea value={charityDesc} onChange={e => setCharityDesc(e.target.value)} placeholder="Description (optional)..." rows={3}
                className="w-full bg-background border border-surfaceHover focus:border-secondary rounded-xl px-5 py-3 text-white outline-none text-sm resize-none" />
              <button type="submit" className="w-full bg-secondary/10 text-secondary border border-secondary/30 font-bold px-6 py-3 rounded-xl hover:bg-secondary hover:text-white transition flex items-center justify-center gap-2 text-sm">
                <Plus size={18} /> Add Charity
              </button>
            </form>
          </div>
          <div className="bg-surface p-8 rounded-3xl border border-surfaceHover shadow-xl max-h-[500px] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Active Partners ({charities.length})</h2>
            <div className="space-y-3">
              {charities.length === 0
                ? <p className="text-gray-500 text-sm text-center py-8">No charities added yet.</p>
                : charities.map(c => (
                  <div key={c.id} className="bg-background border border-surfaceHover p-4 rounded-xl flex justify-between items-start gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                    </div>
                    <button onClick={() => deleteCharity(c.id)} className="text-gray-600 hover:text-red-400 transition shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <h2 className="col-span-full text-xl font-bold flex items-center gap-3"><BarChart2 className="text-primary" /> Reports & Analytics</h2>
          {[
            { label: 'Total Users', value: allUsers.length, sub: `${activeMembers} active subscribers` },
            { label: 'Total Prize Pool', value: `$${totalPool.toFixed(2)}`, sub: 'Current rollover balance' },
            { label: 'Charity Contributions', value: `$${totalCharity.toFixed(2)}`, sub: 'Estimated from active subs' },
            { label: 'Est. Monthly Revenue', value: `$${(activeMembers * 19.99).toFixed(2)}`, sub: 'Based on monthly plan rate' },
            { label: 'Total Winners', value: winners.length, sub: `${winners.filter(w => w.status === 'paid').length} paid out` },
            { label: 'Pending Verifications', value: winners.filter(w => w.status === 'pending').length, sub: 'Awaiting admin review' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface border border-surfaceHover rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
