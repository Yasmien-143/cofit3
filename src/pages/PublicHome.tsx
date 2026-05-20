import React, { useState, useEffect } from 'react';
import { Dumbbell, Clock, MapPin, Phone, CheckCircle, ArrowRight, MessageCircle, Share2, Globe } from 'lucide-react';
import { getSettings, getTrainers, getMembers, getSessions } from '../utils/store';
import { GymSettings } from '../types';

interface PublicHomeProps {
  onEnterPortal: () => void;
  onStartRegistration: (plan: string) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ onEnterPortal, onStartRegistration }) => {
  const [settings, setSettings] = useState<GymSettings>(getSettings());
  const [selectedService, setSelectedService] = useState<null | { title: string; description: string }>(null);
  const [stats, setStats] = useState({ trainers: 0, members: 0, sessions: 0 });

  const mapEmbedUrl = settings.mapUrl.includes('output=embed')
    ? settings.mapUrl
    : `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`;

  useEffect(() => {
    const syncData = () => {
      setSettings(getSettings());
      setStats({
        trainers: getTrainers().length,
        members: getMembers().length,
        sessions: getSessions().length,
      });
    };

    syncData();
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, []);
  const plans = [
    { name: 'Basic', price: 1500, features: ['Gym Access', 'Locker Room', '2 Guest Passes/mo'] },
    { name: 'Pro', price: 2500, features: ['Gym Access', 'Locker Room', 'Personal Trainer', 'Group Classes'] },
    { name: 'Elite', price: 5000, features: ['24/7 Access', 'Private Locker', 'Personal Trainer', 'Nutrition Plan', 'Spa & Sauna'] },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-black tracking-tighter italic">CO-FIT</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest text-slate-600">
            <a href="#about" className="hover:text-orange-600 transition-colors">About</a>
            <a href="#classes" className="hover:text-orange-600 transition-colors">Classes</a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">Pricing</a>
            <button 
              onClick={onEnterPortal}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              Staff & Member Portal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover brightness-50"
            alt="Gym Background"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6 italic">
              TRANSFORM <br />
              <span className="text-orange-500">YOUR LIMITS.</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 leading-relaxed">
              Experience the premium fitness community in the heart of the city. High-end equipment, expert trainers, and a results-driven atmosphere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-orange-700 transition-all"
              >
                START YOUR JOURNEY
              </button>
              <button 
                onClick={() => document.getElementById('classes')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-black text-lg hover:bg-white/20 transition-all"
              >
                VIEW CLASSES
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-black text-orange-500 mb-2">{stats.trainers}</div>
              <div className="text-slate-400 uppercase tracking-widest text-sm font-bold">Expert Trainers</div>
            </div>
            <div>
              <div className="text-5xl font-black text-orange-500 mb-2">{stats.members}</div>
              <div className="text-slate-400 uppercase tracking-widest text-sm font-bold">Active Members</div>
            </div>
            <div>
              <div className="text-5xl font-black text-orange-500 mb-2">24/7</div>
              <div className="text-slate-400 uppercase tracking-widest text-sm font-bold">Gym Access</div>
            </div>
            <div>
              <div className="text-5xl font-black text-orange-500 mb-2">{stats.sessions}</div>
              <div className="text-slate-400 uppercase tracking-widest text-sm font-bold">Active Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Classes */}
      <section id="classes" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 uppercase italic">What We Offer</h2>
            <div className="w-20 h-2 bg-orange-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.services.map((service, i) => (
              <div key={i} className="group relative h-[450px] overflow-hidden rounded-3xl shadow-2xl">
                <img src={service.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={service.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-3xl font-black text-white italic uppercase">{service.title}</h3>
                  <button
                    onClick={() => setSelectedService({ title: service.title, description: service.description })}
                    className="mt-4 text-orange-500 font-bold flex items-center gap-2 group-hover:gap-4 transition-all"
                  >
                    LEARN MORE <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8">
            <h3 className="text-2xl font-black uppercase italic text-slate-900">{selectedService.title}</h3>
            <p className="mt-4 text-slate-600 leading-relaxed">{selectedService.description}</p>
            <button
              onClick={() => setSelectedService(null)}
              className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 uppercase italic">Choose Your Plan</h2>
            <p className="text-slate-500">Flexible memberships for every fitness level.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`p-10 rounded-3xl border-2 flex flex-col ${plan.name === 'Pro' ? 'border-orange-600 shadow-2xl scale-105 bg-slate-900 text-white' : 'border-slate-100 bg-white'}`}>
                <div className="text-xl font-black uppercase mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">₱{plan.price.toLocaleString()}</span>
                  <span className={plan.name === 'Pro' ? 'text-slate-400' : 'text-slate-500'}>/mo</span>
                </div>
                <ul className="space-y-4 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                      <span className={plan.name === 'Pro' ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => onStartRegistration(plan.name)}
                  className={`mt-10 py-4 rounded-xl font-black transition-all ${plan.name === 'Pro' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-900 text-white hover:bg-orange-600'}`}
                >
                  GET STARTED NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Dumbbell className="w-10 h-10 text-orange-600" />
              <span className="text-3xl font-black tracking-tighter italic">{settings.brandName}</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              {settings.brandDescription}
            </p>
            <div className="flex gap-4">
              {settings.socialLinks.map((social, index) => (
                <a
                  key={social.id}
                  href={social.href || '#'}
                  target="_blank"
                  rel="noreferrer"
                  title={social.label}
                  className="bg-slate-800 p-3 rounded-full hover:bg-orange-600 transition-colors"
                >
                  {index === 0 ? <Globe /> : index === 1 ? <Share2 /> : <MessageCircle />}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-6 italic uppercase">Locate Us</h4>
            <div className="space-y-4 text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="text-orange-600 flex-shrink-0" />
                <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors underline">
                  {settings.address}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-orange-600 flex-shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-orange-600 flex-shrink-0" />
                <span>{settings.operatingHours}</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 mt-4">
                <iframe
                  title="Co-Fit Map"
                  src={mapEmbedUrl}
                  className="w-full h-40"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-6 italic uppercase">Quick Links</h4>
            <ul className="space-y-3 text-slate-400">
              {settings.quickLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.href || '#'} className="hover:text-orange-500 transition-colors">{link.label}</a>
                </li>
              ))}
              <li><button onClick={onEnterPortal} className="hover:text-orange-500 transition-colors text-left">{settings.internalPortalLabel}</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          {settings.footerCopyright}
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
