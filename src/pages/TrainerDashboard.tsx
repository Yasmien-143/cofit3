import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getTrainers, updateTrainer, getMembers, getPayments, updateMember, addSession, getSessions } from '../utils/store';
import { Users, Calendar, Save, Trash2, X, Info, Upload } from 'lucide-react';
import { Trainer, Member, Payment, Session } from '../types';

const TrainerDashboard: React.FC = () => {
  const location = useLocation();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Trainer>>({});
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '08:00 AM',
    category: 'Leg Day'
  });

  const path = location.pathname.split('/').pop() || 'trainer';
  const view = path === 'members' ? 'members' : path === 'schedule' ? 'schedule' : path === 'profile' ? 'profile' : 'dashboard';

  useEffect(() => {
    const allTrainers = getTrainers();
    const loggedInId = localStorage.getItem('cofit_user_id');
    const currentTrainer = allTrainers.find(t => t.id === loggedInId);
    
    if (!currentTrainer) return;

    setTrainer(currentTrainer);
    setEditForm(currentTrainer);
    
    const allMembers = getMembers();
    const myMembers = allMembers.filter(m => m.trainerId === currentTrainer.id);
    setMembers(myMembers);

    const allPayments = getPayments();
    const myMemberPayments = allPayments.filter(p => myMembers.some(m => m.id === p.memberId));
    setPayments(myMemberPayments);

    setSessions(getSessions().filter(s => s.trainerId === currentTrainer.id));
  }, []);

  const handleSaveProfile = () => {
    if (trainer && editForm) {
      updateTrainer(trainer.id, editForm);
      setTrainer({ ...trainer, ...editForm });
      setIsEditing(false);
    }
  };

  const handleSetSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer || !selectedMember) return;

    const newSession: Session = {
      id: 's' + Math.random().toString(36).substr(2, 9),
      memberId: selectedMember.id,
      trainerId: trainer.id,
      date: sessionForm.date,
      time: sessionForm.time,
      category: sessionForm.category,
      status: 'scheduled'
    };

    addSession(newSession);
    updateMember(selectedMember.id, { trainingTime: sessionForm.time });
    setSessions([...sessions, newSession]);
    setShowSessionModal(false);
    alert(`Session set for ${selectedMember.name}`);
  };

  if (!trainer) return null;

  return (
    <div className="space-y-8">
      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase italic text-slate-900">Schedule Session</h3>
              <button onClick={() => setShowSessionModal(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            <form onSubmit={handleSetSession} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Target Client</label>
                <div className="bg-slate-50 p-3 rounded-xl font-bold text-slate-800">{selectedMember?.name}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Training Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                  value={sessionForm.date}
                  onChange={e => setSessionForm({...sessionForm, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Start Time</label>
                  <input 
                    type="text" 
                    required
                    placeholder="08:00 AM"
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    value={sessionForm.time}
                    onChange={e => setSessionForm({...sessionForm, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold appearance-none"
                    value={sessionForm.category}
                    onChange={e => setSessionForm({...sessionForm, category: e.target.value})}
                  >
                    <option>Leg Day</option>
                    <option>Arm Day</option>
                    <option>Chest Day</option>
                    <option>Back Day</option>
                    <option>Cardio Blast</option>
                    <option>Yoga Session</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all mt-4 shadow-lg shadow-slate-200">
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">
            {view === 'dashboard' ? 'Dashboard' : view === 'members' ? 'My Members' : view === 'schedule' ? 'Weekly Schedule' : 'My Profile'}
          </h1>
          <p className="text-slate-500 font-medium">Welcome back, {trainer.name}</p>
        </div>
      </header>

      {view === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><Users /></div>
              <div>
                <div className="text-2xl font-black">{members.length}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Clients</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600"><Calendar /></div>
              <div>
                <div className="text-2xl font-black">₱{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Sales Generated</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">My Profile</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Edit Profile</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 px-4 py-2 text-sm font-bold">Cancel</button>
                  <button onClick={handleSaveProfile} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative group">
                  <img src={trainer.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" alt="" />
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result as string;
                            setEditForm({ ...editForm, avatar: result });
                            setTrainer((prev) => (prev ? { ...prev, avatar: result } : prev));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <Upload className="w-4 h-4 mr-1" /> Upload JPG
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{trainer.name}</h3>
                  <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">{trainer.specialization.join(' • ')}</p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bio / Training Style</label>
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                      value={editForm.experience || ''}
                      onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                      placeholder="Experience (e.g. 5 years)"
                    />
                    <textarea 
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      value={editForm.bio || ''}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-black uppercase text-orange-600">{trainer.experience}</p>
                    <p className="text-slate-600 leading-relaxed">{trainer.bio || 'Professional trainer dedicated to your success.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'members' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Member Info</th>
                  <th className="px-6 py-4">Body Stats</th>
                  <th className="px-6 py-4">Session Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                        <div>
                          <div className="font-black text-slate-900 uppercase italic text-sm">{m.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{m.plan} Member</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div>
                          <div className="text-[8px] font-black uppercase text-slate-400">Weight</div>
                          <div className="text-sm font-bold">{m.progress?.[m.progress.length - 1]?.weight || '--'} kg</div>
                        </div>
                        <div>
                          <div className="text-[8px] font-black uppercase text-slate-400">Height</div>
                          <div className="text-sm font-bold">{m.height || '--'} cm</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{m.trainingTime || 'Not Scheduled'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{m.membershipStatus}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedMember(m);
                          setShowSessionModal(true);
                        }}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 shadow-md shadow-orange-100"
                      >
                        Set Session
                      </button>
                      <button
                        onClick={() => {
                          const weight = prompt('Enter latest weight (kg):', `${m.progress?.[m.progress.length - 1]?.weight || ''}`);
                          const height = prompt('Enter latest height (cm):', `${m.height || ''}`);
                          const w = Number(weight);
                          const h = Number(height);
                          if (!Number.isFinite(w) || w <= 0) return;
                          const progress = [
                            ...(m.progress || []),
                            {
                              date: new Date().toISOString().split('T')[0],
                              weight: w,
                              height: Number.isFinite(h) && h > 0 ? h : m.height || 0,
                              bodyFat: 0,
                              notes: 'Trainer update',
                            },
                          ];
                          updateMember(m.id, {
                            progress,
                            height: Number.isFinite(h) && h > 0 ? h : m.height,
                          });
                          const refreshed = getMembers().filter((member) => member.trainerId === trainer.id);
                          setMembers(refreshed);
                        }}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700"
                      >
                        Log Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'profile' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">My Profile</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Edit Profile</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="text-slate-500 px-4 py-2 text-sm font-bold">Cancel</button>
                <button onClick={handleSaveProfile} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative group">
              <img src={trainer.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" alt="" />
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        setEditForm({ ...editForm, avatar: result });
                        setTrainer((prev) => (prev ? { ...prev, avatar: result } : prev));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Upload className="w-4 h-4 mr-1" /> Upload JPG
                </label>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{trainer.name}</h3>
              <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">{trainer.specialization.join(' • ')}</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bio / Training Style</label>
            {isEditing ? (
              <textarea
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            ) : (
              <p className="text-slate-600 leading-relaxed">{trainer.bio || 'Professional trainer dedicated to your success.'}</p>
            )}
          </div>
        </div>
      )}

      {view === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 mb-8 flex items-center gap-2">
              <Calendar className="text-orange-600" /> Training Calendar View
            </h2>
            
            <div className="grid gap-4">
              {sessions.sort((a,b) => a.date.localeCompare(b.date)).map((s, idx) => (
                <div key={idx} className="group flex items-center gap-6 p-6 bg-white rounded-2xl border-2 border-slate-50 hover:border-orange-500 transition-all shadow-sm">
                  <div className="bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center">
                    <div className="text-[10px] font-black uppercase opacity-60">{new Date(s.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-2xl font-black">{new Date(s.date).getDate()}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{s.category}</span>
                       <span className="text-[10px] font-bold text-slate-400">@ {s.time}</span>
                    </div>
                    <div className="text-xl font-black text-slate-900 uppercase italic">
                      {members.find(m => m.id === s.memberId)?.name}
                    </div>
                  </div>

                  <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No sessions scheduled yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
