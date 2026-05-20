import React from 'react';
import { Dumbbell, Shield, User } from 'lucide-react';
import { Role } from '../types';

interface LandingPageProps {
  onLogin: (role: Role, userId?: string) => void;
  onBack: () => void;
}

import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'member' as Role,
      title: 'Member Portal',
      description: 'Access your workout plans, track progress, and manage payments.',
      icon: User,
      color: 'bg-blue-500',
      mockEmail: ''
    },
    {
      id: 'trainer' as Role,
      title: 'Trainer Portal',
      description: 'Manage your clients, schedules, and training sessions.',
      icon: Dumbbell,
      color: 'bg-orange-500',
      mockEmail: ''
    },
    {
      id: 'admin' as Role,
      title: 'Admin Dashboard',
      description: 'Full system management, financial reports, and user oversight.',
      icon: Shield,
      color: 'bg-slate-900',
      mockEmail: 'admin@cofit.com'
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    
    setTimeout(() => {
      // CLEAR ANY OLD SESSION DATA FIRST
      localStorage.removeItem('cofit_user_id');

      if (selectedRole === 'admin') {
        const adminData = JSON.parse(localStorage.getItem('cofit_admin') || '{"email":"admin@cofit.com","password":"adminpassword"}');
        if (email === adminData.email && password === adminData.password) {
          onLogin(selectedRole, 'admin_master');
        } else {
          alert('ADMIN ERROR: Wrong credentials.');
        }
      } else if (selectedRole === 'trainer') {
        const trainers = JSON.parse(localStorage.getItem('cofit_trainers') || '[]');
        const found = trainers.find((t: any) => t.email.toLowerCase() === email.toLowerCase() && t.password === password);
        if (found) {
          onLogin(selectedRole, found.id);
        } else {
          alert('TRAINER ERROR: Invalid email or password.');
        }
      } else if (selectedRole === 'member') {
        const members = JSON.parse(localStorage.getItem('cofit_members') || '[]');
        const found = members.find((m: any) => m.email.toLowerCase() === email.toLowerCase() && m.password === password);
        if (found) {
          onLogin(selectedRole, found.id);
        } else {
          alert('MEMBER ERROR: Account not found. Please sign up first.');
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <button 
        onClick={selectedRole ? () => setSelectedRole(null) : onBack}
        className="absolute top-8 left-8 text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-all z-10 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span className="uppercase text-[10px] tracking-[0.2em]">{selectedRole ? 'Back to Selection' : 'Back to Website'}</span>
      </button>

      {!selectedRole ? (
        <div className="max-w-6xl w-full relative z-10">
          <div className="text-center mb-14">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
                <Dumbbell className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter italic">CO-FIT</h1>
            </div>
            <p className="text-slate-300 text-xl font-semibold">Premium Gym Management Systems.</p>
            <p className="text-slate-500 text-base mt-1">Select your gateway to excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setEmail(role.mockEmail);
                  setPassword('');
                }}
                className="relative bg-[#14181f] p-9 rounded-[2.5rem] border border-slate-800 hover:border-orange-500/50 transition-all group overflow-hidden text-left shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.03] to-transparent rounded-bl-full" />
                <div className={`${role.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl`}>
                  <role.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tight">{role.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm mb-7 font-medium min-h-[64px]">{role.description}</p>
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-orange-500 group-hover:gap-4 transition-all">
                  Access Portal <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-[#14181f] p-12 rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
            
            <div className="text-center mb-10">
              <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl ${roles.find(r => r.id === selectedRole)?.color}`}>
                {(() => {
                  const Icon = roles.find(r => r.id === selectedRole)?.icon || User;
                  return <Icon className="w-12 h-12" />;
                })()}
              </div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                {selectedRole} Access
              </h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">Secure Authentication Required</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Professional Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-[#0d1015] border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-white placeholder:text-slate-700"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Security Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-[#0d1015] border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-white placeholder:text-slate-700"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-500 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-600 shadow-xl shadow-orange-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Authorize Access <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
              <button className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors">
                Request Credential Recovery
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
            System v2.4.0 • Secured by Co-Fit Shield
          </p>
        </div>
      )}

      <footer className="mt-14 text-slate-500 text-sm tracking-wide">
        © 2024 Co-Fit Fitness Club. Built for excellence.
      </footer>
    </div>
  );
};

export default LandingPage;
