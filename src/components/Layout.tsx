import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Dumbbell, LogOut, ShieldCheck, User, History, Settings } from 'lucide-react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout }) => {
  const location = useLocation();

  const menuItems = {
    member: [
      { name: 'Dashboard', path: '/member', icon: LayoutDashboard },
      { name: 'My Trainer', path: '/member/trainer', icon: Dumbbell },
      { name: 'My Progress', path: '/member/progress', icon: History },
      { name: 'My Profile', path: '/member/profile', icon: User },
      { name: 'Payments', path: '/member/payments', icon: CreditCard },
    ],
    trainer: [
      { name: 'Dashboard', path: '/trainer', icon: LayoutDashboard },
      { name: 'My Members', path: '/trainer/members', icon: Users },
      { name: 'Schedule', path: '/trainer/schedule', icon: Dumbbell },
      { name: 'My Profile', path: '/trainer/profile', icon: User },
    ],
    admin: [
      { name: 'Overview', path: '/admin', icon: LayoutDashboard },
      { name: 'Manage Members', path: '/admin/members', icon: Users },
      { name: 'Manage Trainers', path: '/admin/trainers', icon: Dumbbell },
      { name: 'Payments', path: '/admin/payments', icon: ShieldCheck },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  };

  const currentMenu = menuItems[role];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            <Dumbbell className="w-8 h-8" />
            Co-Fit
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{role} Portal</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {currentMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="mt-8 pt-6 border-t border-slate-200 text-center text-slate-500 text-sm">
          © 2024 Co-Fit Fitness Club. Built for excellence.
        </footer>
      </main>
    </div>
  );
};

export default Layout;
