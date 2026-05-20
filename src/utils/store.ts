import { Member, Trainer, Payment, GymSettings, Session } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'cofit_members',
  TRAINERS: 'cofit_trainers',
  PAYMENTS: 'cofit_payments',
  SETTINGS: 'cofit_settings',
  SESSIONS: 'cofit_sessions',
};

const syncStateToDatabase = async () => {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        members: getMembers(),
        trainers: getTrainers(),
        payments: getPayments(),
        sessions: getSessions(),
        settings: getSettings(),
        admin: JSON.parse(localStorage.getItem('cofit_admin') || '{"email":"admin@cofit.com","password":"adminpassword"}'),
      }),
    });
  } catch {
    // Keep UI usable offline; sync can retry on next mutation.
  }
};

const defaultSettings: GymSettings = {
  brandName: 'CO-FIT',
  address: '123 Fitness Ave, Makati City, Metro Manila, Philippines',
  mapUrl: 'https://maps.google.com/?q=123+Fitness+Ave,+Makati+City,+Metro+Manila,+Philippines',
  phone: '+63 (02) 8888-9999',
  email: 'contact@cofit.com',
  operatingHours: 'Mon-Sun: 24/7 Access',
  brandDescription: 'Premium fitness facility dedicated to empowering individuals through strength, community, and expert guidance. Join us today.',
  internalPortalLabel: 'Internal Portal',
  footerCopyright: '© 2024 CO-FIT PREMIUM GYM. ALL RIGHTS RESERVED.',
  socialLinks: [
    { id: 'soc1', label: 'Instagram', href: 'https://instagram.com' },
    { id: 'soc2', label: 'Facebook', href: 'https://facebook.com' },
    { id: 'soc3', label: 'TikTok', href: 'https://tiktok.com' },
  ],
  quickLinks: [
    { id: 'q1', label: 'Career', href: '#' },
    { id: 'q2', label: 'Terms of Service', href: '#' },
    { id: 'q3', label: 'Privacy Policy', href: '#' },
  ],
  services: [
    {
      id: 's1',
      title: 'Weight Training',
      description: 'Structured strength progression with coach-guided compound lifts, accessory programming, and recovery planning for measurable gains.',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 's2',
      title: 'Cardio Blast',
      description: 'Heart-rate-based conditioning blocks for fat loss, stamina, and endurance built through interval systems and progressive load.',
      image: 'https://images.unsplash.com/photo-1518611012118-296072bb5604?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 's3',
      title: 'Yoga & Pilates',
      description: 'Mobility, breathing, and flexibility sessions to improve posture, recovery, and injury prevention while balancing intense training.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

// INITIALIZE EMPTY ARRAYS - System starts with ZERO users
if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
}
if (!localStorage.getItem(STORAGE_KEYS.TRAINERS)) {
  localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify([]));
}
if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
}
if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
}
if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
}

// Master Admin is the only pre-existing record
if (!localStorage.getItem('cofit_admin')) {
  localStorage.setItem('cofit_admin', JSON.stringify({ email: 'admin@cofit.com', password: 'adminpassword' }));
}

export const getMembers = (): Member[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
export const saveMembers = (members: Member[]) => {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  void syncStateToDatabase();
};

export const getTrainers = (): Trainer[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAINERS) || '[]');
export const saveTrainers = (trainers: Trainer[]) => {
  localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
  void syncStateToDatabase();
};

export const getPayments = (): Payment[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
export const savePayments = (payments: Payment[]) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  void syncStateToDatabase();
};

export const getSessions = (): Session[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
export const saveSessions = (sessions: Session[]) => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  void syncStateToDatabase();
};

export const getSettings = (): GymSettings => {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  return {
    ...defaultSettings,
    ...parsed,
    socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks : defaultSettings.socialLinks,
    quickLinks: Array.isArray(parsed.quickLinks) ? parsed.quickLinks : defaultSettings.quickLinks,
    services: Array.isArray(parsed.services) ? parsed.services : defaultSettings.services,
  };
};
export const saveSettings = (settings: GymSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  void syncStateToDatabase();
};

export const addMember = (member: Member) => {
  const members = getMembers();
  members.push(member);
  saveMembers(members);
};

export const addSession = (session: Session) => {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
};

export const addPayment = (payment: Payment) => {
  const payments = getPayments();
  payments.unshift(payment);
  savePayments(payments);
};

export const updatePayment = (id: string, updates: Partial<Payment>) => {
  const payments = getPayments();
  const index = payments.findIndex((p) => p.id === id);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...updates };
    savePayments(payments);
  }
};

export const updateMember = (id: string, updates: Partial<Member>) => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updates };
    saveMembers(members);
  }
};

export const updateTrainer = (id: string, updates: Partial<Trainer>) => {
  const trainers = getTrainers();
  const index = trainers.findIndex(t => t.id === id);
  if (index !== -1) {
    trainers[index] = { ...trainers[index], ...updates };
    saveTrainers(trainers);
  }
};
