import React, { useState } from 'react';
import { getSettings, saveSettings } from '../utils/store';
import { MapPin, Phone, Mail, Clock, Save } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  const mapEmbedUrl = settings.mapUrl.includes('output=embed')
    ? settings.mapUrl
    : `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`;

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gym Location & Contact</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Brand Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.brandName}
            onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Footer Brand Description</label>
          <textarea
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            rows={3}
            value={settings.brandDescription}
            onChange={(e) => setSettings({ ...settings, brandDescription: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Address
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            rows={3}
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Location GPS Link (Google Maps)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.mapUrl}
            onChange={(e) => setSettings({ ...settings, mapUrl: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-2">Paste a Google Maps URL. The map preview below updates automatically.</p>
          <a
            href={settings.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-orange-600 hover:underline"
          >
            Open Map Link
          </a>
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
            <iframe
              title="Location Map Preview"
              src={mapEmbedUrl}
              className="w-full h-56"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Operating Hours
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.operatingHours}
            onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Internal Portal Label</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.internalPortalLabel}
            onChange={(e) => setSettings({ ...settings, internalPortalLabel: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Footer Copyright</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.footerCopyright}
            onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Social Links</h3>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, socialLinks: [...settings.socialLinks, { id: `soc${Date.now()}`, label: 'New Social', href: 'https://' }] })}
              className="text-xs font-black uppercase text-orange-600"
            >
              + Add Social
            </button>
          </div>
          {settings.socialLinks.map((social, index) => (
            <div key={social.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="text"
                className="px-3 py-2 border border-slate-200 rounded-lg"
                value={social.label}
                onChange={(e) => {
                  const socialLinks = [...settings.socialLinks];
                  socialLinks[index] = { ...socialLinks[index], label: e.target.value };
                  setSettings({ ...settings, socialLinks });
                }}
              />
              <input
                type="text"
                className="px-3 py-2 border border-slate-200 rounded-lg"
                value={social.href}
                onChange={(e) => {
                  const socialLinks = [...settings.socialLinks];
                  socialLinks[index] = { ...socialLinks[index], href: e.target.value };
                  setSettings({ ...settings, socialLinks });
                }}
              />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, socialLinks: settings.socialLinks.filter((_, i) => i !== index) })}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-black text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Quick Links</h3>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, quickLinks: [...settings.quickLinks, { id: `q${Date.now()}`, label: 'New Link', href: '#' }] })}
              className="text-xs font-black uppercase text-orange-600"
            >
              + Add Link
            </button>
          </div>
          {settings.quickLinks.map((link, index) => (
            <div key={link.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="text"
                className="px-3 py-2 border border-slate-200 rounded-lg"
                value={link.label}
                onChange={(e) => {
                  const quickLinks = [...settings.quickLinks];
                  quickLinks[index] = { ...quickLinks[index], label: e.target.value };
                  setSettings({ ...settings, quickLinks });
                }}
              />
              <input
                type="text"
                className="px-3 py-2 border border-slate-200 rounded-lg"
                value={link.href}
                onChange={(e) => {
                  const quickLinks = [...settings.quickLinks];
                  quickLinks[index] = { ...quickLinks[index], href: e.target.value };
                  setSettings({ ...settings, quickLinks });
                }}
              />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, quickLinks: settings.quickLinks.filter((_, i) => i !== index) })}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-black text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">What We Offer</h3>
            <button
              type="button"
              onClick={() => setSettings({
                ...settings,
                services: [
                  ...settings.services,
                  { id: `s${Date.now()}`, title: 'New Service', description: 'Service description', image: '' },
                ],
              })}
              className="text-xs font-black uppercase text-orange-600"
            >
              + Add Service
            </button>
          </div>
          {settings.services.map((service, index) => (
            <div key={service.id} className="space-y-2 p-3 border border-slate-200 rounded-lg">
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={service.title}
                onChange={(e) => {
                  const services = [...settings.services];
                  services[index] = { ...services[index], title: e.target.value };
                  setSettings({ ...settings, services });
                }}
                placeholder="Title"
              />
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                rows={2}
                value={service.description}
                onChange={(e) => {
                  const services = [...settings.services];
                  services[index] = { ...services[index], description: e.target.value };
                  setSettings({ ...settings, services });
                }}
                placeholder="Description"
              />
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={service.image}
                onChange={(e) => {
                  const services = [...settings.services];
                  services[index] = { ...services[index], image: e.target.value };
                  setSettings({ ...settings, services });
                }}
                placeholder="Image URL"
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const services = [...settings.services];
                    services[index] = { ...services[index], image: reader.result as string };
                    setSettings({ ...settings, services });
                  };
                  reader.readAsDataURL(file);
                }}
                className="w-full text-xs"
              />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, services: settings.services.filter((_, i) => i !== index) })}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-black text-xs"
              >
                Delete Service
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-700 transition-all"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Settings Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
