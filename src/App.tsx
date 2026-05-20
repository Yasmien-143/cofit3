import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MemberDashboard from './pages/MemberDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicHome from './pages/PublicHome';
import SignupPage from './pages/SignupPage';
import Layout from './components/Layout';
import { Role, Member } from './types';

function App() {
  const [showPortal, setShowPortal] = useState(false);
  const [registrationPlan, setRegistrationPlan] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [role, setRole] = useState<Role | null>(() => {
    const saved = localStorage.getItem('cofit_role');
    return (saved as Role) || null;
  });

  const handleLogin = (selectedRole: Role, userId?: string) => {
    setRole(selectedRole);
    localStorage.setItem('cofit_role', selectedRole);
    if (userId) {
      localStorage.setItem('cofit_user_id', userId);
    }
  };

  const handleStartRegistration = (plan: string) => {
    setRegistrationPlan(plan);
  };

  const handleSignupComplete = (member: Member) => {
    setRole('member');
    setRegistrationPlan(null);
    setShowPortal(true);
    localStorage.setItem('cofit_role', 'member');
    localStorage.setItem('cofit_user_id', member.id);
  };

  const handleLogout = () => {
    setRole(null);
    setShowPortal(false);
    setRegistrationPlan(null);
    localStorage.removeItem('cofit_role');
    localStorage.removeItem('cofit_user_id');
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch('/api/bootstrap');
        if (!res.ok) {
          setBootstrapped(true);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data.members)) localStorage.setItem('cofit_members', JSON.stringify(data.members));
        if (Array.isArray(data.trainers)) localStorage.setItem('cofit_trainers', JSON.stringify(data.trainers));
        if (Array.isArray(data.payments)) localStorage.setItem('cofit_payments', JSON.stringify(data.payments));
        if (Array.isArray(data.sessions)) localStorage.setItem('cofit_sessions', JSON.stringify(data.sessions));
        if (data.settings && typeof data.settings === 'object') localStorage.setItem('cofit_settings', JSON.stringify(data.settings));
        if (data.admin && typeof data.admin === 'object') localStorage.setItem('cofit_admin', JSON.stringify(data.admin));
      } catch {
        // fallback to existing local data if server unavailable
      } finally {
        setBootstrapped(true);
      }
    };

    bootstrap();
  }, []);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-500 font-black">CO-FIT</p>
          <p className="text-slate-300 mt-2">Loading database data...</p>
        </div>
      </div>
    );
  }

  if (registrationPlan) {
    return (
      <SignupPage 
        plan={registrationPlan} 
        onSignupComplete={handleSignupComplete} 
        onBack={() => setRegistrationPlan(null)} 
      />
    );
  }

  if (!showPortal && !role) {
    return <PublicHome onEnterPortal={() => setShowPortal(true)} onStartRegistration={handleStartRegistration} />;
  }

  if (!role) {
    return <LandingPage onLogin={handleLogin} onBack={() => setShowPortal(false)} />;
  }

  return (
    <BrowserRouter>
      <Layout role={role} onLogout={handleLogout}>
        <Routes>
          {role === 'member' && (
            <>
              <Route path="/member" element={<MemberDashboard />} />
              <Route path="/member/trainer" element={<MemberDashboard />} />
              <Route path="/member/progress" element={<MemberDashboard />} />
              <Route path="/member/profile" element={<MemberDashboard />} />
              <Route path="/member/payments" element={<MemberDashboard />} />
              <Route path="*" element={<Navigate to="/member" replace />} />
            </>
          )}
          {role === 'trainer' && (
            <>
              <Route path="/trainer" element={<TrainerDashboard />} />
              <Route path="/trainer/members" element={<TrainerDashboard />} />
              <Route path="/trainer/schedule" element={<TrainerDashboard />} />
              <Route path="/trainer/profile" element={<TrainerDashboard />} />
              <Route path="*" element={<Navigate to="/trainer" replace />} />
            </>
          )}
          {role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/members" element={<AdminDashboard />} />
              <Route path="/admin/trainers" element={<AdminDashboard />} />
              <Route path="/admin/payments" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          )}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
