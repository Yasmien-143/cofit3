import React, { useState } from 'react';
import { Dumbbell, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Member } from '../types';
import { addMember, getMembers } from '../utils/store';

interface SignupPageProps {
  plan: string;
  onSignupComplete: (member: Member) => void;
  onBack: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ plan, onSignupComplete, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const exists = getMembers().some((m) => m.email.toLowerCase() === normalizedEmail);
    if (exists) {
      alert('This email is already registered. Please log in instead.');
      return;
    }

    setLoading(true);

    // Create a new distinct member object with provided password
    const newMember: Member = {
      id: 'm' + Math.random().toString(36).substr(2, 9),
      name,
      email: normalizedEmail,
      password, // Storing the chosen password
      role: 'member',
      membershipStatus: 'unpaid',
      plan: plan.toLowerCase() as any,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      height: 0,
      progress: []
    };

    setTimeout(() => {
      addMember(newMember);
      onSignupComplete(newMember);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors"
      >
        ← Back to Pricing
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
              <Dumbbell className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase italic">
              Join Co-Fit
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Signing up for the <span className="text-orange-600 font-black uppercase">{plan} Plan</span>
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  placeholder="Yasmien"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-xs leading-relaxed">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
