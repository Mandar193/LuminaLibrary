import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Key,
  ChevronRight,
  RefreshCw,
  Clock,
  User,
  Plus,
  Trash2,
  Mail,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './firebase';
import { updateProfile } from 'firebase/auth';
import { firebaseService } from './firebaseService';
import { Admin } from './types';

interface SettingsProps {
  onUserUpdate?: () => void;
}

export default function Settings({ onUserUpdate }: SettingsProps) {
  const sections = [
    { title: 'General Configuration', icon: SettingsIcon, desc: 'Manage your library name, timezone, and regional settings.' },
    { title: 'Security & Auth', icon: Shield, desc: 'Configure two-factor authentication and session data.' },
    { title: 'Notifications', icon: Bell, desc: 'Choose how you want to be alerted for overdue items.' },
    { title: 'API Access', icon: Key, desc: 'Manage integration keys for external cataloging tools.' },
  ];

  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || '');
  const email = user?.email || '';
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Admin Management State
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [isAdminPanelLoading, setIsAdminPanelLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkAdminStatus = async () => {
      // Bootstrap admin check
      if (user.email === "ssnhtr1980@gmail.com") {
        setIsAdmin(true);
        return;
      }

      // Check if user exists in admins collection
      try {
        const isAdminFound = await firebaseService.isUserAdmin(user.uid);
        setIsAdmin(isAdminFound);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = firebaseService.subscribeToAdmins(setAdmins);
    return () => unsubscribe();
  }, [isAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminUid) return;
    setIsAdminPanelLoading(true);
    try {
      await firebaseService.addAdmin(newAdminUid, newAdminEmail);
      setNewAdminEmail('');
      setNewAdminUid('');
    } catch (error) {
      console.error("Failed to add admin:", error);
    } finally {
      setIsAdminPanelLoading(false);
    }
  };

  const handleRemoveAdmin = async (uid: string, email: string) => {
    if (uid === user?.uid && email === "ssnhtr1980@gmail.com") {
      alert("Cannot remove the primary bootstrap administrator.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${email} from administrators?`)) return;
    try {
      await firebaseService.removeAdmin(uid, email);
    } catch (error) {
      console.error("Failed to remove admin:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setShowSuccess(false);
    try {
      await updateProfile(user, { displayName: name });
      await firebaseService.logActivity(`Admin updated profile name to: ${name}`);
      if (onUserUpdate) onUserUpdate();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">System Preferences</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Global configuration for the Lumina Management Platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Administrator Settings</h3>
            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-slate-50">
              <div className="relative group">
                <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                  <User size={32} />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white text-slate-600 p-2 rounded-lg border border-slate-200 shadow-sm hover:text-indigo-600 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-tight">{user?.displayName || 'Administrator'}</p>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Platform Identity</p>
                <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">
                  UID: {auth.currentUser?.uid}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Identifier</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm opacity-50 cursor-not-allowed outline-none"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-4 mt-4">
                {showSuccess && (
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">
                    Changes Persisted Successfully
                  </span>
                )}
                <button type="button" onClick={() => setName(user?.displayName || '')} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">Revert</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all uppercase tracking-widest disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Commit Changes'}
                </button>
              </div>
            </form>
          </div>

          {isAdmin && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Access Control</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Manage system-level administrator privileges.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                  <Shield size={12} className="text-indigo-600" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{admins.length} Active Admins</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <AnimatePresence mode="popLayout">
                  {admins.map((admin) => (
                    <motion.div 
                      key={admin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-slate-200 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-none">{admin.email}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[200px]">ID: {admin.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Added On</p>
                          <p className="text-[10px] text-slate-900 font-bold mt-1">
                            {admin.addedAt?.toDate().toLocaleDateString() || 'Bootstrap'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Privileges"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Register New Instance Primary</h4>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="email"
                        placeholder="Administrator Email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs outline-none focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Account UID"
                        value={newAdminUid}
                        onChange={(e) => setNewAdminUid(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs outline-none focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isAdminPanelLoading || !newAdminEmail || !newAdminUid}
                    className="w-full h-10 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Authorize Administrator
                  </button>
                </form>
                <p className="text-[9px] text-slate-400 text-center mt-4 px-8 leading-relaxed">
                  Warning: Authorizing a new administrator grants full read/write access to all library collections. Please verify UIDs carefully.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col group cursor-pointer hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <s.icon size={20} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info / Status Columns */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Instance Runtime</p>
                  <p className="text-xl font-bold">Lumina Library V4.2</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center animation-spin-slow">
                  <RefreshCw size={20} className="text-indigo-400" />
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-indigo-500 h-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                />
              </div>
              <button className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] uppercase font-bold rounded-lg tracking-widest hover:bg-white/10 transition-all">Check Cloud Availability</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Service Health</h4>
            <div className="space-y-4">
              {[
                { label: 'Database Mesh', status: 'Stable', time: '14ms', color: 'emerald-500' },
                { label: 'Asset Storage', status: 'Optimal', time: '99.9%', color: 'emerald-500' },
                { label: 'Search Index', status: 'Delayed', time: '+1s', color: 'amber-500' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                    <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.status}</span>
                    <span className="text-[10px] font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{s.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900">Next Audit Log Backup</p>
                <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed font-medium">Platform state synchronization is scheduled for Sunday at 02:00 AM UTC.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
