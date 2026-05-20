import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMembers, updateMember, getTrainers, addPayment, getPayments, getSessions } from '../utils/store';
import { User, Calendar, CheckCircle, History, Wallet, DollarSign, ArrowRight, Activity, Trash2, Download, Upload } from 'lucide-react';
import { Member, Trainer, Payment, Session } from '../types';

const MemberDashboard: React.FC = () => {
  const location = useLocation();
  const [member, setMember] = useState<Member | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [step, setStep] = useState<'view' | 'pay' | 'method' | 'trainer'>('view');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'e-wallet' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trainer' | 'payments' | 'progress' | 'profile'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [progDate, setProgDate] = useState(new Date().toISOString().split('T')[0]);
  const [progWeight, setProgWeight] = useState('');
  const [progHeight, setProgHeight] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editName, setEditName] = useState('');
  const [editHeight, setEditHeight] = useState('');

  const path = location.pathname.split('/').pop() || 'member';

  useEffect(() => {
    const allMembers = getMembers();
    const loggedInId = localStorage.getItem('cofit_user_id');
    
    const currentUser = allMembers.find(m => m.id === loggedInId);
    
    if (!currentUser) return;
    
    // ONLY set initial step if it's the first load
    if (!member) {
      const isNew = currentUser.membershipStatus === 'unpaid';
      if (isNew) {
        setStep('trainer');
      } else {
        setStep('view');
      }
    }

    const allTrainers = getTrainers().filter(t => t.isApproved);
    setMember(currentUser);
    setTrainers(allTrainers);
    setPayments(getPayments().filter(p => p.memberId === currentUser.id));
    setSessions(getSessions().filter(s => s.memberId === currentUser.id));
    
    const currentTab = path === 'trainer' ? 'trainer' : path === 'payments' ? 'payments' : path === 'progress' ? 'progress' : path === 'profile' ? 'profile' : 'overview';
    setActiveTab(currentTab);
  }, [path, member?.id]);

  const pricingPlans = [
    { name: 'Basic', price: 1500, features: ['Gym Access', 'Locker Room'] },
    { name: 'Pro', price: 2500, features: ['Gym Access', 'Locker Room', 'Personal Trainer'] },
    { name: 'Elite', price: 5000, features: ['Gym Access', 'Locker Room', 'Personal Trainer', 'Nutrition Plan', 'Spa'] },
  ];

  const handlePay = () => {
    if (!member || !selectedPlan || !paymentMethod) return;

    const newPayment: Payment = {
      id: 'p' + Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      memberName: member.name,
      amount: selectedPlan.price,
      date: new Date().toISOString().split('T')[0],
      status: paymentMethod === 'cash' ? 'pending' : 'completed',
      plan: selectedPlan.name + ' Plan',
      method: paymentMethod
    };

    addPayment(newPayment);
    updateMember(member.id, { 
      plan: selectedPlan.name.toLowerCase() as any,
      membershipStatus: paymentMethod === 'cash' ? 'pending' : 'active',
      lastPaymentDate: newPayment.date,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    
    setMember({ ...member, plan: selectedPlan.name.toLowerCase() as any, membershipStatus: 'active' });
    setPayments([newPayment, ...payments]);
    setStep('view'); // Finish payment, go to dashboard
  };

  const selectTrainer = (trainerId: string) => {
    if (!member) return;
    updateMember(member.id, { trainerId, trainingTime: '08:00 AM - 09:00 AM' });
    setMember({ ...member, trainerId, trainingTime: '08:00 AM - 09:00 AM' });
    setStep('pay'); // Selected trainer, now go to pay
  };

  if (!member) return null;

  const currentTrainer = trainers.find(t => t.id === member.trainerId);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 italic uppercase">
            {activeTab === 'overview' ? 'Dashboard' : activeTab === 'trainer' ? 'My Trainer' : activeTab === 'progress' ? 'My Progress' : activeTab === 'profile' ? 'My Profile' : 'Payments'}
          </h1>
          <p className="text-slate-500">Welcome back, {member.name}!</p>
        </div>
        {member.membershipStatus === 'unpaid' && step === 'view' && (
          <button 
            onClick={() => setStep('pay')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 animate-pulse"
          >
            Pay Membership
          </button>
        )}
      </header>

      {step === 'view' && (
        <>
          {(activeTab === 'overview' || activeTab === 'trainer') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-widest">Plan</h2>
                  <CheckCircle className={`w-5 h-5 ${member.membershipStatus === 'active' ? 'text-green-500' : 'text-slate-300'}`} />
                </div>
                <div className="text-2xl font-black text-slate-900 capitalize">{member.plan || 'No Plan'}</div>
                <p className="text-slate-500 text-sm mt-1">Status: <span className="font-bold uppercase">{member.membershipStatus}</span></p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-widest">Your Trainer</h2>
                  <User className="text-orange-500 w-5 h-5" />
                </div>
                {currentTrainer ? (
                  <div className="flex items-center gap-3">
                    <img src={currentTrainer.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <div className="font-bold text-slate-900">{currentTrainer.name}</div>
                      <div className="text-xs text-slate-500 uppercase">{currentTrainer.specialization[0]}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No trainer assigned</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-widest">Next Session</h2>
                  <Calendar className="text-blue-500 w-5 h-5" />
                </div>
                <div className="text-lg font-bold text-slate-900">{member.trainingTime || 'Not Set'}</div>
                {currentTrainer?.schedule.find(s => s.time === member.trainingTime)?.focus && (
                  <div className="mt-2 text-xs font-black bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block uppercase">
                    {currentTrainer.schedule.find(s => s.time === member.trainingTime)?.focus}
                  </div>
                )}
                <p className="text-slate-500 text-[10px] mt-1 italic">Consult trainer for routine changes</p>
              </div>
            </div>
          )}

          {activeTab === 'trainer' && currentTrainer && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-black uppercase tracking-widest mb-8 italic">Your Assigned Trainer</h2>
                <div className="flex flex-col md:flex-row items-start gap-10">
                    <img src={currentTrainer.avatar} className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl ring-8 ring-slate-50" alt="" />
                    <div className="space-y-6 flex-1">
                      <div>
                          <div className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">Master Coach</div>
                          <div className="text-4xl font-black text-slate-900 uppercase italic leading-none">{currentTrainer.name}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Specialization</div>
                            <div className="text-sm font-bold text-slate-700">{currentTrainer.specialization.join(' • ')}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</div>
                            <div className="text-sm font-bold text-slate-700">{currentTrainer.experience}</div>
                        </div>
                      </div>
                      <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">About the Coach</div>
                          <p className="text-slate-600 leading-relaxed italic">"{currentTrainer.bio || 'Professional trainer dedicated to your success and transformation goals.'}"</p>
                      </div>
                      <div className="pt-4 flex items-center gap-2">
                        <div className="flex text-orange-500">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-5 h-5 ${i < Math.floor(currentTrainer.rating) ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        <span className="text-sm font-black text-slate-900">{currentTrainer.rating} / 5.0 Rating</span>
                      </div>
                    </div>
                </div>
              </div>

              {/* Review Section */}
              <div className="bg-slate-900 p-8 rounded-3xl text-white">
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 italic">Submit a Review</h3>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setReviewRating(star)}
                        className={`${reviewRating >= star ? 'text-orange-500' : 'text-slate-700'} hover:scale-110 transition-transform`}
                      >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-white" 
                    placeholder="Describe your experience with this coach..."
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!reviewText) return alert('Please enter a review.');
                      alert(`Thank you for reviewing ${currentTrainer.name}! Your ${reviewRating}-star review has been submitted.`);
                      setReviewText('');
                    }}
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-orange-600 transition-all"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'payments') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Payment History</h2>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <tr key={p.id} className="text-sm">
                      <td className="px-6 py-4 text-slate-600">{p.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{p.plan}</td>
                      <td className="px-6 py-4 font-black">₱{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 capitalize text-slate-500">{p.method}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          p.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Track Your Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    type="date" 
                    className="border p-3 rounded-xl bg-slate-50 outline-none" 
                    value={progDate}
                    onChange={(e) => setProgDate(e.target.value)}
                  />
                  <input 
                    type="number" 
                    className="border p-3 rounded-xl bg-slate-50 outline-none" 
                    placeholder="Weight (kg)" 
                    value={progWeight}
                    onChange={(e) => setProgWeight(e.target.value)}
                  />
                  <input 
                    type="number" 
                    className="border p-3 rounded-xl bg-slate-50 outline-none" 
                    placeholder="Height (cm)" 
                    value={progHeight}
                    onChange={(e) => setProgHeight(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      const weight = parseFloat(progWeight);
                      const height = parseFloat(progHeight);
                      if (!progDate || isNaN(weight)) return;
                      const newProg = [...(member.progress || []), { date: progDate, weight, height: height || member.height || 0, bodyFat: 0, notes: 'Physical Update' }];
                      updateMember(member.id, { progress: newProg, height: height || member.height });
                      setMember({ ...member, progress: newProg, height: height || member.height });
                      setProgWeight('');
                      setProgHeight('');
                    }}
                    className="bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-900 transition-all"
                  >
                    Add Record
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 font-black uppercase text-[10px] tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Weight</th>
                      <th className="px-6 py-4">Height</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(member.progress || []).map((p, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 font-bold text-slate-900">{p.date}</td>
                        <td className="px-6 py-4 text-slate-600">{p.weight} kg</td>
                        <td className="px-6 py-4 text-slate-600">{p.height} cm</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-between">
                              <span className="text-green-600 font-black uppercase text-[10px]">Logged</span>
                              <button 
                                onClick={() => {
                                  const newProg = (member.progress || []).filter((_, index) => index !== i);
                                  updateMember(member.id, { progress: newProg });
                                  setMember({...member, progress: newProg});
                                }}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {(!member.progress || member.progress.length === 0) && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No records yet. Start tracking today!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <h2 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Training Session Calendar</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Category / Focus</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.length > 0 ? sessions.map(s => (
                        <tr key={s.id}>
                          <td className="px-6 py-4 font-bold text-slate-900">{s.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.time}</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">
                              {s.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                              s.date === new Date().toISOString().split('T')[0] 
                              ? 'bg-red-600 text-white animate-pulse' 
                              : 'bg-green-100 text-green-700'
                            }`}>
                              {s.date === new Date().toISOString().split('T')[0] ? 'LIVE NOW' : s.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                            No sessions scheduled yet. Your trainer will set your schedule here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-orange-50 p-8 rounded-3xl border-2 border-orange-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h3 className="text-xl font-black text-orange-900 uppercase italic">Schedule a Consultation</h3>
                    <p className="text-orange-700 font-medium">Want to adjust your goals? Send a priority message to your Master Coach.</p>
                  </div>
                  <button 
                    onClick={() => alert('Consultation request queued. Your trainer will be notified immediately!')}
                    className="w-full md:w-auto bg-orange-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 hover:scale-105 transition-all"
                  >
                    SEND REQUEST
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">Member Profile</h2>
                  {!isEditingProfile ? (
                    <button 
                      onClick={() => {
                        setEditName(member.name);
                        setEditHeight(member.height?.toString() || '');
                        setIsEditingProfile(true);
                      }} 
                      className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold"
                    >
                      Edit Stats
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingProfile(false)} className="text-slate-500 px-4 py-2 text-sm font-bold">Cancel</button>
                      <button 
                        onClick={() => {
                          const h = parseFloat(editHeight);
                          updateMember(member.id, { 
                            name: editName,
                            height: h
                          });
                          setMember({
                            ...member,
                            name: editName,
                            height: h
                          });
                          setIsEditingProfile(false);
                        }} 
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold"
                      >
                        Save Profile
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 pb-8 border-b border-slate-100 mb-8">
                  <div className="relative group">
                    <img src={member.avatar} className="w-24 h-24 rounded-3xl object-cover shadow-lg" alt="" />
                    {isEditingProfile && (
                      <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = reader.result as string;
                              updateMember(member.id, { avatar: dataUrl });
                              setMember({ ...member, avatar: dataUrl });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <Upload className="w-3 h-3 mr-1" /> Upload JPG
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-orange-600 font-bold uppercase text-[10px] tracking-widest">{member.plan} Membership</p>
                      <button 
                        onClick={() => {
                          const nextPlan = member.plan === 'basic' ? 'pro' : member.plan === 'pro' ? 'elite' : 'basic';
                          if (confirm(`Upgrade to ${nextPlan.toUpperCase()}?`)) {
                            updateMember(member.id, { plan: nextPlan as any });
                            setMember({...member, plan: nextPlan as any});
                          }
                        }}
                        className="text-[8px] bg-slate-100 px-2 py-0.5 rounded font-black uppercase hover:bg-orange-100 hover:text-orange-600 transition-colors"
                      >
                        Change Plan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Display Name</label>
                    {isEditingProfile ? (
                      <input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-50 border p-3 rounded-xl outline-none font-bold" 
                      />
                    ) : (
                      <div className="text-lg font-bold text-slate-900">{member.name}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Email Address</label>
                    <div className="text-lg font-bold text-slate-900">{member.email}</div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Current Height (cm)</label>
                    {isEditingProfile ? (
                      <input 
                        type="number" 
                        value={editHeight}
                        onChange={(e) => setEditHeight(e.target.value)}
                        className="w-full bg-slate-50 border p-3 rounded-xl outline-none font-bold" 
                      />
                    ) : (
                      <div className="text-lg font-bold text-slate-900">{member.height || '--'} cm</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Current Weight (kg)</label>
                    <div className="text-lg font-bold text-slate-900">{member.progress?.[member.progress.length - 1]?.weight || '--'} kg</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'payments') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  <h2 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Transaction Records</h2>
                </div>
                <button 
                  onClick={() => alert('Download requested for all transaction logs...')}
                  className="text-xs font-black text-orange-600 hover:underline uppercase"
                >
                  Export Data
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Plan Description</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <tr key={p.id} className="text-sm">
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 uppercase italic">{p.plan}</td>
                      <td className="px-6 py-4 font-black">₱{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 capitalize text-slate-500">{p.method}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert(`Downloading Receipt #${p.id}...`)}
                          className="text-slate-400 hover:text-orange-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No payments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {step === 'pay' && (
        <div className="space-y-6">
          <button onClick={() => setStep('view')} className="text-slate-500 hover:text-slate-900 font-bold">← Cancel</button>
          <h2 className="text-2xl font-black italic uppercase">Choose your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map(plan => (
              <div key={plan.name} className="bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-orange-500 transition-all group">
                <div className="text-xl font-black uppercase mb-2">{plan.name}</div>
                <div className="text-4xl font-black text-slate-900 mb-6">₱{plan.price.toLocaleString()}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-orange-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => { setSelectedPlan(plan); setStep('method'); }}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'method' && (
        <div className="max-w-md mx-auto space-y-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-black italic uppercase">Payment Method</h2>
            <p className="text-slate-500">Paying for {selectedPlan?.name} Plan (₱{selectedPlan?.price.toLocaleString()})</p>
          </div>
          <div className="grid gap-4">
            <button 
              onClick={() => { setPaymentMethod('e-wallet'); handlePay(); }}
              className="flex items-center gap-4 p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-orange-500 transition-all text-left"
            >
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Wallet /></div>
              <div>
                <div className="font-bold text-lg">E-Wallet</div>
                <div className="text-sm text-slate-500">GCash, Maya, GrabPay</div>
              </div>
              <ArrowRight className="ml-auto text-slate-300" />
            </button>
            <button 
              onClick={() => { setPaymentMethod('cash'); handlePay(); }}
              className="flex items-center gap-4 p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-orange-500 transition-all text-left"
            >
              <div className="bg-green-100 p-3 rounded-xl text-green-600"><DollarSign /></div>
              <div>
                <div className="font-bold text-lg">Cash</div>
                <div className="text-sm text-slate-500">Pay at front desk</div>
              </div>
              <ArrowRight className="ml-auto text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {step === 'trainer' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black italic uppercase text-center">Select Your Trainer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trainers.map(t => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <img src={t.avatar} className="w-24 h-24 rounded-full mx-auto object-cover mb-4 ring-4 ring-orange-50" alt="" />
                <h3 className="text-xl font-bold text-slate-900">{t.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{t.specialization.join(', ')}</p>
                <div className="text-orange-500 font-bold mb-6">★ {t.rating}</div>
                <button 
                  onClick={() => selectTrainer(t.id)}
                  className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
                >
                  Choose Trainer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
