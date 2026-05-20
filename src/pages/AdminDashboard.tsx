import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMembers, getTrainers, getPayments, updateTrainer, updateMember, saveMembers, saveTrainers, getSessions, addMember, updatePayment } from '../utils/store';
import { Users, DollarSign, ArrowUpRight, ShieldCheck, Check, Trash2, Calendar, X, Mail, Lock, User, Plus, Settings } from 'lucide-react';
import { Member, Trainer, Payment, Session } from '../types';
import AdminSettings from '../components/AdminSettings';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const path = location.pathname.split('/').pop() || 'admin';
  const activeTab = path === 'members' ? 'members' : path === 'trainers' ? 'trainers' : path === 'payments' ? 'payments' : path === 'settings' ? 'settings' : 'overview';

  useEffect(() => {
    setMembers(getMembers());
    setTrainers(getTrainers());
    setPayments(getPayments());
    setSessions(getSessions());
  }, [activeTab]);

  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

  const approveTrainer = (id: string) => {
    updateTrainer(id, { isApproved: true });
    setTrainers(getTrainers());
  };

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Fitness Coach',
    experience: '1 year',
  });
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'basic' as 'basic' | 'pro' | 'elite',
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const trainer: Trainer = {
      id: 't' + Math.random().toString(36).substr(2, 9),
      name: newStaff.name,
      email: newStaff.email,
      password: newStaff.password,
      role: 'trainer',
      specialization: [newStaff.specialization],
      members: [],
      schedule: [],
      rating: 5.0,
      experience: newStaff.experience,
      isApproved: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStaff.name)}&background=random`
    };
    const updated = [...trainers, trainer];
    saveTrainers(updated);
    setTrainers(updated);
    setShowStaffModal(false);
    setNewStaff({ name: '', email: '', password: '', specialization: 'Fitness Coach', experience: '1 year' });
    alert('Staff added successfully!');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = members.some((m) => m.email.toLowerCase() === newMember.email.toLowerCase());
    if (exists) {
      alert('Member email already exists.');
      return;
    }
    addMember({
      id: 'm' + Math.random().toString(36).substr(2, 9),
      name: newMember.name,
      email: newMember.email.toLowerCase(),
      password: newMember.password,
      role: 'member',
      membershipStatus: 'active',
      plan: newMember.plan,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newMember.name)}&background=random`,
      progress: [],
      height: 0,
    });
    setMembers(getMembers());
    setShowMemberModal(false);
    setNewMember({ name: '', email: '', password: '', plan: 'basic' });
  };

  const deleteMember = (id: string) => {
    const filtered = members.filter(m => m.id !== id);
    saveMembers(filtered);
    setMembers(filtered);
  };

  return (
    <div className="space-y-8 relative">
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black uppercase italic">Add Member</h3>
              <button onClick={() => setShowMemberModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 border rounded-xl"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-xl"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
              <input
                required
                type="text"
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-xl"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
              />
              <select
                className="w-full px-4 py-3 border rounded-xl"
                value={newMember.plan}
                onChange={(e) => setNewMember({ ...newMember, plan: e.target.value as 'basic' | 'pro' | 'elite' })}
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-600">
                Create Member Account
              </button>
            </form>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              {/* Form Side */}
              <div className="flex-1 p-10 border-r border-slate-50">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-black uppercase italic text-slate-900">Add Trainer</h3>
                    <button onClick={() => setShowStaffModal(false)} className="md:hidden"><X /></button>
                 </div>
                 <form onSubmit={handleAddStaff} className="space-y-5">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trainer Full Name</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                            value={newStaff.name}
                            onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                          />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required 
                            type="email"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                            value={newStaff.email}
                            onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Temporary Password</label>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                             <input 
                               required 
                               type="password"
                               className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                               value={newStaff.password}
                               onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Role Specialty</label>
                          <select 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold appearance-none"
                            value={newStaff.specialization}
                            onChange={e => setNewStaff({...newStaff, specialization: e.target.value})}
                          >
                             <option>Fitness Coach</option>
                             <option>Yoga Instructor</option>
                             <option>Bodybuilding Pro</option>
                             <option>Nutritionist</option>
                          </select>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Experience</label>
                       <input
                         type="text"
                         className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                         value={newStaff.experience}
                         onChange={e => setNewStaff({ ...newStaff, experience: e.target.value })}
                       />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 mt-4">
                       Create Staff Account
                    </button>
                 </form>
              </div>

              {/* Preview Side */}
              <div className="w-80 bg-slate-50 p-10 flex flex-col items-center justify-center text-center">
                 <div className="relative mb-6">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(newStaff.name || 'Trainer')}&background=0F172A&color=fff&size=200`} 
                      className="w-32 h-32 rounded-3xl shadow-2xl object-cover" 
                      alt="" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl text-white shadow-lg"><Check className="w-4 h-4" /></div>
                 </div>
                 <h4 className="text-xl font-black text-slate-900 uppercase italic leading-tight">{newStaff.name || 'Trainer Name'}</h4>
                 <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">{newStaff.specialization}</p>
                 <div className="mt-8 space-y-3 w-full">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 text-left">
                       <Mail className="w-3 h-3 inline mr-2" /> {newStaff.email || 'email@cofit.com'}
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 text-left">
                       <Lock className="w-3 h-3 inline mr-2" /> ••••••••
                    </div>
                 </div>
                 <button onClick={() => setShowStaffModal(false)} className="mt-auto text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel Creation
                 </button>
              </div>
           </div>
        </div>
      )}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">Admin Command</h1>
          <p className="text-slate-500">System Control & Financial Oversight</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Stats Overview' },
            { id: 'members', label: 'Manage Members' },
            { id: 'trainers', label: 'Manage Staff' },
            { id: 'payments', label: 'Payment Records' },
            { id: 'settings', label: 'Gym Settings' }
          ].filter(t => t.id === activeTab).map(tab => (
            <div
              key={tab.id}
              className="px-6 py-2 bg-white shadow-sm text-orange-600 rounded-lg text-sm font-black uppercase tracking-widest"
            >
              {tab.label}
            </div>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center text-green-600 mb-4"><DollarSign /></div>
              <div className="text-2xl font-black">₱{totalRevenue.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gross Revenue</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-4"><Users /></div>
              <div className="text-2xl font-black">{members.length}</div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Members</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center text-orange-600 mb-4"><ShieldCheck /></div>
              <div className="text-2xl font-black">{trainers.length}</div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Staff Count</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center text-purple-600 mb-4"><ArrowUpRight /></div>
              <div className="text-2xl font-black">12%</div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Rate</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h2 className="font-bold uppercase tracking-widest text-sm">Master Schedule Calendar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-black uppercase text-[10px] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Session</th>
                      <th className="px-6 py-4">Trainer</th>
                      <th className="px-6 py-4">Member</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.map(s => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 font-bold">{s.date}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{s.category}</div>
                          <div className="text-slate-400 uppercase text-[8px]">{s.time}</div>
                        </td>
                        <td className="px-6 py-4">{trainers.find(t => t.id === s.trainerId)?.name}</td>
                        <td className="px-6 py-4 font-medium">{members.find(m => m.id === s.memberId)?.name}</td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No scheduled activities yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100"><h2 className="font-bold uppercase tracking-widest text-sm">Recent Transactions</h2></div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {payments.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 font-bold">{p.memberName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.plan}</td>
                      <td className="px-6 py-4 font-black">₱{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowMemberModal(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-3 bg-orange-50 text-orange-700 text-xs font-bold">
            Prompt: Use Reset to change credentials, Settings to edit profile, and Trash to delete member.
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Member Identity</th>
                  <th className="px-6 py-4">Credentials</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Live Status</th>
                  <th className="px-6 py-4 text-right">Administrative Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(m => (
                <tr key={m.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={m.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                      <div className="text-xl font-black text-slate-900 leading-none">{m.name}</div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded w-fit">{m.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Mail className="w-4 h-4 text-orange-600" /> {m.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-black text-slate-900 bg-orange-50 px-2 py-1 rounded border border-orange-100 w-fit">
                          <Lock className="w-3 h-3 inline mr-1 text-orange-600" /> {m.password || 'Not set'}
                        </div>
                        <button 
                          onClick={() => {
                            const newPass = prompt('Reset Password for ' + m.name + ':', m.password || '');
                            if (newPass) {
                              updateMember(m.id, { password: newPass });
                              setMembers(getMembers());
                            }
                          }}
                          className="text-[9px] font-black uppercase text-slate-400 hover:text-orange-600 underline underline-offset-2"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={m.plan}
                      onChange={(e) => {
                        updateMember(m.id, { plan: e.target.value as any });
                        setMembers(getMembers());
                      }}
                      className="text-xs font-black uppercase text-orange-600 bg-transparent border-none outline-none cursor-pointer"
                    >
                      <option value="basic">Basic Plan</option>
                      <option value="pro">Pro Plan</option>
                      <option value="elite">Elite Plan</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <select 
                        value={m.membershipStatus}
                        onChange={(e) => {
                          const status = e.target.value as any;
                          updateMember(m.id, { membershipStatus: status });
                          setMembers(getMembers());
                        }}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase outline-none border transition-all ${
                          m.membershipStatus === 'active' 
                          ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                          : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        <option value="active">Live Access</option>
                        <option value="inactive">Suspended</option>
                        <option value="unpaid">Unpaid/New</option>
                      </select>
                      <div className="text-[8px] font-bold text-center text-slate-400 uppercase tracking-tighter italic">Joined: {m.joinedDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const newName = prompt('Enter new name:', m.name);
                          if (newName) {
                            updateMember(m.id, { name: newName });
                            setMembers(getMembers());
                          }
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMember(m.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {activeTab === 'trainers' && (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button 
              onClick={() => setShowStaffModal(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all flex items-center gap-2"
             >
               <Plus className="w-4 h-4" /> Add New Staff
             </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold uppercase tracking-widest text-sm">Staff Management</h2>
            </div>
            <div className="px-6 py-3 bg-orange-50 text-orange-700 text-xs font-bold">
              Prompt: Use Edit to update trainer password/experience, Check to approve, and Trash to remove trainer.
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Credentials (E/P)</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainers.map(t => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={t.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div>
                        <div className="font-bold">{t.name}</div>
                        <div className="text-[10px] text-slate-400">ID: {t.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold text-slate-900 flex items-center gap-2">
                          <Mail className="w-3 h-3 text-orange-600" /> {t.email}
                        </div>
                        <div className="flex items-center gap-2 justify-between">
                          <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                            <Lock className="w-3 h-3 text-slate-400" /> {t.password || 'Not set'}
                          </div>
                          <button 
                            onClick={() => {
                              const newPass = prompt('Reset Staff Password for ' + t.name + ':', t.password || '');
                              if (newPass) {
                                updateTrainer(t.id, { password: newPass });
                                setTrainers(getTrainers());
                              }
                            }}
                            className="text-[8px] font-black text-orange-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{t.specialization.join(', ')}</td>
                    <td className="px-6 py-4">
                      {t.isApproved ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Approved</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {!t.isApproved && (
                        <button 
                          onClick={() => approveTrainer(t.id)}
                          className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const updated = trainers.filter(trainer => trainer.id !== t.id);
                          saveTrainers(updated);
                          setTrainers(updated);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const exp = prompt('Edit Experience:', t.experience);
                          if (exp) {
                            updateTrainer(t.id, { experience: exp });
                            setTrainers(getTrainers());
                          }
                        }}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-3 bg-orange-50 text-orange-700 text-xs font-bold">
            Prompt: Cash payments must be approved by Admin before membership becomes active.
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">Member / Physical Stats</th>
                <th className="px-6 py-4">Assigned Trainer</th>
                <th className="px-6 py-4">Plan / Amount</th>
                <th className="px-6 py-4">Method / Date</th>
                <th className="px-6 py-4">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => {
                const member = members.find(m => m.id === p.memberId);
                const trainer = trainers.find(t => t.id === member?.trainerId);
                return (
                  <tr key={p.id}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.memberName}</div>
                      <div className="flex gap-2 text-[8px] font-black uppercase text-slate-400 mt-1">
                        <span>W: {member?.progress?.[member.progress.length - 1]?.weight || '--'}kg</span>
                        <span>H: {member?.height || '--'}cm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden">
                           <img src={trainer?.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium">{trainer?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold uppercase text-orange-600">{p.plan}</div>
                      <div className="text-lg font-black">₱{p.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="uppercase text-[10px] font-black text-slate-400">{p.method}</div>
                      <div className="text-sm text-slate-600">{p.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.method === 'cash' && p.status === 'pending' ? (
                        <button
                          onClick={() => {
                            updatePayment(p.id, { status: 'completed' });
                            updateMember(p.memberId, { membershipStatus: 'active' });
                            setPayments(getPayments());
                            setMembers(getMembers());
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-green-700"
                        >
                          Approve Cash
                        </button>
                      ) : (
                        <span className={`text-[10px] font-black uppercase ${p.status === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>
                          {p.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
};

export default AdminDashboard;
